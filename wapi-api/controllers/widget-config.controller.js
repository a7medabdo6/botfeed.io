import WidgetConfig from '../models/widget-config.model.js';
import WebConversation from '../models/web-conversation.model.js';
import WebMessage from '../models/web-message.model.js';

export async function list(req, res) {
  try {
    const configs = await WidgetConfig.find({ user_id: req.user._id }).sort({ created_at: -1 }).lean();
    return res.json({ success: true, data: configs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getById(req, res) {
  try {
    const config = await WidgetConfig.findOne({ _id: req.params.id, user_id: req.user._id }).lean();
    if (!config) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: config });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function create(req, res) {
  try {
    const config = await WidgetConfig.create({ ...req.body, user_id: req.user._id });
    return res.status(201).json({ success: true, data: config });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function update(req, res) {
  try {
    const config = await WidgetConfig.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!config) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: config });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function remove(req, res) {
  try {
    const config = await WidgetConfig.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
    if (!config) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getConversations(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = { user_id: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.widget_config_id) filter.widget_config_id = req.query.widget_config_id;

    const [conversations, total] = await Promise.all([
      WebConversation.find(filter).sort({ last_message_at: -1 }).skip(skip).limit(limit).lean(),
      WebConversation.countDocuments(filter),
    ]);
    return res.json({ success: true, data: conversations, pagination: { page, limit, total } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getConversationMessages(req, res) {
  try {
    const conversation = await WebConversation.findOne({ _id: req.params.conversationId, user_id: req.user._id });
    if (!conversation) return res.status(404).json({ success: false, message: 'Not found' });

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const skip = (page - 1) * limit;

    const messages = await WebMessage.find({ conversation_id: conversation._id })
      .sort({ created_at: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.json({ success: true, data: messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function replyToConversation(req, res) {
  try {
    const conversation = await WebConversation.findOne({ _id: req.params.conversationId, user_id: req.user._id });
    if (!conversation) return res.status(404).json({ success: false, message: 'Not found' });

    const { handleAgentReply } = await import('../utils/widget-chat-engine.js');
    const io = req.app.get('io');

    const msg = await handleAgentReply({
      conversationId: conversation._id,
      content: req.body.content,
      agentId: req.user._id,
      io,
    });

    return res.json({ success: true, data: msg });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
