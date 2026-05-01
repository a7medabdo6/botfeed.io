import { Message, ChatNote, ChatAssignment, WhatsappConnection, Contact, Tag, WhatsappPhoneNumber, ContactTag, WebConversation, WebMessage, User } from '../models/index.js';
import mongoose from 'mongoose';

const validateWhatsAppConnection = async (userId) => {
  const connection = await WhatsappConnection.findOne({ user_id: userId, is_active: true, deleted_at: null });
  if (!connection) return { isConnected: false, phoneNumber: null };
  return { isConnected: true, phoneNumber: connection.registred_phone_number, connection };
};

/* ──────────────────────────────────────────────
   GET /api/chat/unified  — merged conversation list
   ?channel=all|whatsapp|web  &search=  &is_assigned=  etc.
   ────────────────────────────────────────────── */
export const getUnifiedChats = async (req, res) => {
  try {
    const userId = req.user.owner_id;
    const { channel = 'all', search, start_date, end_date, tags: tagFilter, has_notes, last_message_read, is_assigned, agent_id } = req.query;

    let whatsappChats = [];
    let webChats = [];

    if (channel === 'all' || channel === 'whatsapp') {
      whatsappChats = await fetchWhatsAppChats(userId, req.user, { search, start_date, end_date, tags: tagFilter, has_notes, last_message_read, is_assigned, agent_id, whatsapp_phone_number_id: req.query.whatsapp_phone_number_id });
    }

    if (channel === 'all' || channel === 'web') {
      webChats = await fetchWebChats(userId, req.user, { search, start_date, end_date, tags: tagFilter, has_notes, is_assigned, agent_id });
    }

    const merged = [...whatsappChats, ...webChats].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      const tA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const tB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return tB - tA;
    });

    return res.json({ success: true, data: merged });
  } catch (error) {
    console.error('Error fetching unified chats:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch chats', message: error.message });
  }
};

async function fetchWhatsAppChats(userId, reqUser, filters) {
  const conn = await validateWhatsAppConnection(userId);
  if (!conn.isConnected) return [];
  const myPhone = conn.phoneNumber;

  const sent = await Message.distinct('recipient_number', { sender_number: myPhone, recipient_number: { $ne: null }, deleted_at: null });
  const received = await Message.distinct('sender_number', { recipient_number: myPhone, sender_number: { $ne: null }, deleted_at: null });
  let contactNumbers = [...new Set([...sent.filter(Boolean), ...received.filter(Boolean)])].filter(n => n !== myPhone);

  if (reqUser.role === 'agent') {
    const assignments = await ChatAssignment.find({ agent_id: reqUser.id, $or: [{ status: 'assigned' }, { status: { $exists: false } }] }).select('sender_number receiver_number').lean();
    const assignedSet = new Set();
    assignments.forEach(a => { if (a.sender_number !== myPhone) assignedSet.add(a.sender_number); if (a.receiver_number !== myPhone) assignedSet.add(a.receiver_number); });
    contactNumbers = contactNumbers.filter(n => assignedSet.has(n));
  }

  const contactQuery = { phone_number: { $in: contactNumbers }, created_by: userId, deleted_at: null };
  if (filters.search) contactQuery.$or = [{ name: new RegExp(filters.search, 'i') }, { phone_number: new RegExp(filters.search, 'i') }];
  if (filters.tags) contactQuery.tags = { $in: [filters.tags] };
  if (typeof filters.is_assigned === 'string') {
    const isAssigned = filters.is_assigned === 'true';
    contactQuery.assigned_to = isAssigned ? { $ne: null } : null;
  }

  const contacts = await Contact.find(contactQuery).lean();
  const contactMap = {};
  contacts.forEach(c => { contactMap[c.phone_number] = c; });
  const validNumbers = contacts.map(c => c.phone_number);

  const chats = await Promise.all(validNumbers.map(async (num) => {
    const c = contactMap[num];
    const lastMsg = await Message.findOne({
      $or: [{ sender_number: myPhone, recipient_number: num, deleted_at: null }, { sender_number: num, recipient_number: myPhone, deleted_at: null }]
    }).sort({ wa_timestamp: -1 }).lean();

    if (!lastMsg) return null;

    const unreadCount = await Message.countDocuments({ sender_number: num, recipient_number: myPhone, read_status: 'unread', deleted_at: null });

    return {
      channel: 'whatsapp',
      contact: {
        id: c._id.toString(),
        number: c.phone_number,
        name: c.name || c.phone_number,
        avatar: null,
        labels: [],
        chat_status: c.chat_status || 'open',
      },
      lastMessage: {
        id: lastMsg._id.toString(),
        wa_message_id: lastMsg.wa_message_id,
        content: lastMsg.content,
        messageType: lastMsg.message_type,
        fileUrl: lastMsg.file_url,
        direction: lastMsg.direction,
        fromMe: lastMsg.from_me,
        createdAt: lastMsg.wa_timestamp || lastMsg.created_at,
        unreadCount: String(unreadCount),
      },
      is_pinned: c.is_pinned || false,
    };
  }));

  return chats.filter(Boolean);
}

async function fetchWebChats(userId, reqUser, filters) {
  const query = { user_id: userId };
  if (filters.search) {
    query.$or = [
      { visitor_name: new RegExp(filters.search, 'i') },
      { visitor_email: new RegExp(filters.search, 'i') },
      { visitor_id: new RegExp(filters.search, 'i') },
    ];
  }
  if (filters.tags) query.tags = { $in: [filters.tags] };
  if (typeof filters.is_assigned === 'string') {
    const isAssigned = filters.is_assigned === 'true';
    query.assigned_agent_id = isAssigned ? { $ne: null } : null;
  }
  if (reqUser.role === 'agent') {
    query.assigned_agent_id = reqUser.id;
  }

  const convs = await WebConversation.find(query).sort({ last_message_at: -1 }).lean();

  return convs.map(conv => ({
    channel: 'web',
    contact: {
      id: conv._id.toString(),
      number: conv.visitor_id,
      name: conv.visitor_name || conv.visitor_email || `Visitor ${conv.visitor_id.slice(0, 8)}`,
      avatar: null,
      labels: [],
      chat_status: conv.chat_status || 'open',
      web_status: conv.status,
    },
    lastMessage: {
      id: conv._id.toString(),
      content: conv.last_message_content || '',
      messageType: conv.last_message_type || 'text',
      direction: conv.last_message_direction || 'inbound',
      createdAt: conv.last_message_at || conv.created_at,
      unreadCount: String(conv.unread_count || 0),
    },
    is_pinned: conv.is_pinned || false,
  }));
}

/* ──────────────────────────────────────────────
   GET /api/chat/web/messages/:conversationId
   ────────────────────────────────────────────── */
export const getWebMessages = async (req, res) => {
  try {
    const userId = req.user.owner_id;
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const conv = await WebConversation.findOne({ _id: conversationId, user_id: userId });
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });

    await WebMessage.updateMany({ conversation_id: conversationId, direction: 'inbound', read_status: 'unread' }, { read_status: 'read' });
    await WebConversation.updateOne({ _id: conversationId }, { unread_count: 0 });

    const skip = (Number(page) - 1) * Number(limit);
    const msgs = await WebMessage.find({ conversation_id: conversationId })
      .sort({ created_at: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await WebMessage.countDocuments({ conversation_id: conversationId });

    const formatted = msgs.map(m => ({
      id: m._id.toString(),
      wa_message_id: m._id.toString(),
      content: m.content,
      messageType: m.message_type,
      fileUrl: m.file_url,
      direction: m.direction,
      fromMe: m.from_me,
      createdAt: m.created_at,
      delivery_status: m.delivery_status || 'sent',
      is_delivered: true,
      is_seen: m.read_status === 'read',
      wa_status: m.delivery_status === 'read' ? 'read' : 'delivered',
      sender_type: m.sender_type,
      reply_message_id: m.reply_message_id,
      can_chat: true,
    }));

    return res.json({
      success: true,
      messages: formatMessagesAsDateGroups(formatted, conv),
      pagination: { page: Number(page), limit: Number(limit), total },
    });
  } catch (error) {
    console.error('Error fetching web messages:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

function formatMessagesAsDateGroups(messages, conv) {
  const groups = {};
  for (const msg of messages) {
    const d = new Date(msg.createdAt);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!groups[key]) groups[key] = { dateLabel: label, dateKey: key, messageGroups: [] };

    const visitorName = conv.visitor_name || conv.visitor_email || `Visitor ${conv.visitor_id.slice(0, 8)}`;
    const sender = msg.direction === 'inbound'
      ? { id: conv.visitor_id, name: visitorName, avatar: null }
      : { id: 'agent', name: msg.sender_type === 'bot' ? 'Bot' : 'Agent', avatar: null };
    const recipient = msg.direction === 'inbound'
      ? { id: 'agent', name: 'Agent', avatar: null }
      : { id: conv.visitor_id, name: visitorName, avatar: null };

    groups[key].messageGroups.push({
      senderId: sender.id,
      sender,
      recipient,
      messages: [{
        ...msg,
        sender,
        recipient,
        interactiveData: null,
        template: null,
        can_chat: true,
        delivered_at: null,
        seen_at: null,
        reactions: [],
      }],
      createdAt: msg.createdAt,
      lastMessageTime: msg.createdAt,
    });
  }
  return Object.values(groups);
}

/* ──────────────────────────────────────────────
   POST /api/chat/web/send
   ────────────────────────────────────────────── */
export const sendWebMessage = async (req, res) => {
  try {
    const userId = req.user.owner_id;
    const { conversation_id, message, type = 'text', file_url, file_type, reply_message_id } = req.body;

    const conv = await WebConversation.findOne({ _id: conversation_id, user_id: userId });
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });

    const webMsg = await WebMessage.create({
      conversation_id,
      direction: 'outbound',
      sender_type: 'agent',
      content: message || '',
      message_type: type,
      file_url: file_url || (req.file ? `/uploads/${req.file.filename}` : null),
      file_type: file_type || (req.file ? req.file.mimetype : null),
      from_me: true,
      reply_message_id: reply_message_id || null,
      delivery_status: 'sent',
      read_status: 'read',
    });

    conv.last_message_at = new Date();
    conv.last_message_content = message || (type !== 'text' ? `[${type}]` : '');
    conv.last_message_type = type;
    conv.last_message_direction = 'outbound';
    await conv.save();

    const io = global.__botfeedIo;
    if (io) {
      const widgetNsp = io.of('/widget');
      widgetNsp.to(`conv:${conversation_id}`).emit('widget:reply', {
        _id: webMsg._id.toString(),
        content: webMsg.content,
        sender_type: 'agent',
        message_type: webMsg.message_type,
        file_url: webMsg.file_url,
        created_at: webMsg.created_at,
      });
    }

    return res.json({ success: true, data: { id: webMsg._id.toString(), content: webMsg.content, messageType: webMsg.message_type, createdAt: webMsg.created_at } });
  } catch (error) {
    console.error('Error sending web message:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ──────────────────────────────────────────────
   POST /api/chat/web/pin
   ────────────────────────────────────────────── */
export const toggleWebPin = async (req, res) => {
  try {
    const userId = req.user.owner_id;
    const { conversation_id } = req.body;
    const conv = await WebConversation.findOne({ _id: conversation_id, user_id: userId });
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
    conv.is_pinned = !conv.is_pinned;
    await conv.save();
    return res.json({ success: true, data: { is_pinned: conv.is_pinned } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ──────────────────────────────────────────────
   POST/DELETE /api/chat/web/tag
   ────────────────────────────────────────────── */
export const addWebTag = async (req, res) => {
  try {
    const userId = req.user.owner_id;
    const { conversation_id, tag_id } = req.body;
    const conv = await WebConversation.findOne({ _id: conversation_id, user_id: userId });
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
    const tag = await Tag.findOne({ _id: tag_id, created_by: userId, deleted_at: null });
    if (!tag) return res.status(404).json({ success: false, message: 'Tag not found' });
    if (conv.tags.map(String).includes(String(tag_id))) return res.status(409).json({ success: false, message: 'Tag already assigned' });
    conv.tags.push(tag_id);
    await conv.save();
    await tag.incrementUsage();
    return res.status(201).json({ success: true, message: 'Tag added', data: { id: tag_id } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteWebTag = async (req, res) => {
  try {
    const userId = req.user.owner_id;
    const { conversation_id, tag_id } = req.body;
    const conv = await WebConversation.findOne({ _id: conversation_id, user_id: userId });
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
    const idx = conv.tags.map(String).indexOf(String(tag_id));
    if (idx === -1) return res.status(404).json({ success: false, message: 'Tag not assigned' });
    conv.tags.splice(idx, 1);
    await conv.save();
    const tag = await Tag.findById(tag_id);
    if (tag) await tag.decrementUsage();
    return res.json({ success: true, message: 'Tag removed' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ──────────────────────────────────────────────
   POST/DELETE /api/chat/web/note
   ────────────────────────────────────────────── */
export const addWebNote = async (req, res) => {
  try {
    const userId = req.user.owner_id;
    const { conversation_id, note } = req.body;
    if (!note?.trim()) return res.status(400).json({ success: false, message: 'Note cannot be empty' });
    const conv = await WebConversation.findOne({ _id: conversation_id, user_id: userId });
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
    const newNote = await ChatNote.create({ web_conversation_id: conversation_id, user_id: userId, note: note.trim() });
    return res.status(201).json({ success: true, data: { id: newNote._id.toString(), note: newNote.note, createdAt: newNote.created_at } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteWebNote = async (req, res) => {
  try {
    const userId = req.user.owner_id;
    const { ids } = req.body;
    if (!ids?.length) return res.status(400).json({ success: false, message: 'IDs required' });
    const result = await ChatNote.deleteMany({ _id: { $in: ids }, user_id: userId });
    return res.json({ success: true, data: { deletedCount: result.deletedCount } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getWebNotes = async (req, res) => {
  try {
    const userId = req.user.owner_id;
    const { conversationId } = req.params;
    const notes = await ChatNote.find({ web_conversation_id: conversationId, user_id: userId, deleted_at: null }).sort({ created_at: -1 }).lean();
    return res.json({ success: true, data: notes.map(n => ({ id: n._id.toString(), _id: n._id.toString(), note: n.note, created_at: n.created_at })) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ──────────────────────────────────────────────
   POST /api/chat/web/assign / unassign
   ────────────────────────────────────────────── */
export const assignWebChat = async (req, res) => {
  try {
    const userId = req.user.owner_id;
    const { conversation_id, agent_id } = req.body;
    const conv = await WebConversation.findOne({ _id: conversation_id, user_id: userId });
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
    conv.assigned_agent_id = agent_id;
    if (conv.status === 'bot') conv.status = 'human';
    await conv.save();
    return res.json({ success: true, message: 'Chat assigned', data: conv });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const unassignWebChat = async (req, res) => {
  try {
    const userId = req.user.owner_id;
    const { conversation_id } = req.body;
    const conv = await WebConversation.findOne({ _id: conversation_id, user_id: userId });
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
    conv.assigned_agent_id = null;
    await conv.save();
    return res.json({ success: true, message: 'Chat unassigned' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ──────────────────────────────────────────────
   POST /api/chat/web/status
   ────────────────────────────────────────────── */
export const updateWebChatStatus = async (req, res) => {
  try {
    const userId = req.user.owner_id;
    const { conversation_id, status } = req.body;
    if (!['open', 'resolved'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
    const conv = await WebConversation.findOne({ _id: conversation_id, user_id: userId });
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
    conv.chat_status = status;
    if (status === 'resolved') conv.status = 'closed';
    await conv.save();

    await WebMessage.create({
      conversation_id: conv._id,
      direction: 'outbound',
      sender_type: 'agent',
      content: `Chat marked as ${status}`,
      message_type: 'system_messages',
      from_me: true,
      delivery_status: 'sent',
      read_status: 'read',
    });

    return res.json({ success: true, message: `Chat status updated to ${status}`, data: conv });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ──────────────────────────────────────────────
   GET /api/chat/web/profile/:conversationId
   ────────────────────────────────────────────── */
export const getWebChatProfile = async (req, res) => {
  try {
    const userId = req.user.owner_id;
    const { conversationId } = req.params;
    const conv = await WebConversation.findOne({ _id: conversationId, user_id: userId }).populate('tags').lean();
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });

    const notes = await ChatNote.find({ web_conversation_id: conversationId, user_id: userId, deleted_at: null }).sort({ created_at: -1 }).lean();

    const assignment = conv.assigned_agent_id ? await User.findById(conv.assigned_agent_id).select('name email').lean() : null;

    const mediaMsgs = await WebMessage.find({ conversation_id: conversationId, message_type: { $in: ['image', 'video', 'audio', 'document'] } }).sort({ created_at: -1 }).lean();

    return res.json({
      success: true,
      data: {
        id: conv._id.toString(),
        name: conv.visitor_name || conv.visitor_email || `Visitor ${conv.visitor_id.slice(0, 8)}`,
        email: conv.visitor_email,
        visitor_id: conv.visitor_id,
        status: conv.status,
        chat_status: conv.chat_status,
        is_pinned: conv.is_pinned,
        tags: (conv.tags || []).map(t => ({ _id: t._id?.toString(), label: t.label, color: t.color })),
        notes: notes.map(n => ({ id: n._id.toString(), note: n.note, created_at: n.created_at })),
        assigned_to: assignment ? { id: assignment._id.toString(), name: assignment.name, email: assignment.email } : null,
        metadata: conv.metadata,
        media: mediaMsgs.map(m => ({ id: m._id.toString(), fileUrl: m.file_url, messageType: m.message_type, createdAt: m.created_at })),
        created_at: conv.created_at,
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ──────────────────────────────────────────────
   DELETE /api/chat/web/delete
   ────────────────────────────────────────────── */
export const deleteWebChat = async (req, res) => {
  try {
    const userId = req.user.owner_id;
    const { conversation_ids } = req.body;
    if (!conversation_ids?.length) return res.status(400).json({ success: false, message: 'conversation_ids required' });
    await WebMessage.deleteMany({ conversation_id: { $in: conversation_ids } });
    await WebConversation.deleteMany({ _id: { $in: conversation_ids }, user_id: userId });
    await ChatNote.deleteMany({ web_conversation_id: { $in: conversation_ids } });
    return res.json({ success: true, message: `${conversation_ids.length} conversation(s) deleted` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
