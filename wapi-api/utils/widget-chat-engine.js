import WidgetConfig from '../models/widget-config.model.js';
import WebConversation from '../models/web-conversation.model.js';
import WebMessage from '../models/web-message.model.js';
import Chatbot from '../models/chatbot.model.js';
import { callAIModel } from './ai-utils.js';

let _automationEngine = null;
async function getAutomationEngine() {
  if (!_automationEngine) {
    const mod = await import('./automation-engine.js');
    _automationEngine = mod.default;
  }
  return _automationEngine;
}

const CONTEXT_WINDOW = 20;

export async function handleVisitorMessage({ conversationId, content, io }) {
  const conversation = await WebConversation.findById(conversationId);
  if (!conversation) throw new Error('Conversation not found');

  const widget = await WidgetConfig.findById(conversation.widget_config_id);
  if (!widget) throw new Error('Widget not found');

  const visitorMsg = await WebMessage.create({
    conversation_id: conversationId,
    direction: 'inbound',
    sender_type: 'visitor',
    content,
    message_type: 'text',
  });

  conversation.last_message_at = new Date();
  conversation.unread_count += 1;
  conversation.last_message_content = content;
  conversation.last_message_type = 'text';
  conversation.last_message_direction = 'inbound';
  await conversation.save();

  const globalIo = global.__botfeedIo;
  if (globalIo) {
    globalIo.to(`web-inbox:${conversation.user_id}`).emit('web:new_message', {
      conversationId, direction: 'inbound', content,
    });
  }

  const room = `widget:${conversationId}`;

  if (io) {
    io.of('/widget').to(room).emit('widget:message', {
      _id: visitorMsg._id,
      content: visitorMsg.content,
      direction: 'inbound',
      sender_type: 'visitor',
      created_at: visitorMsg.created_at,
    });
  }

  // Notify dashboard agents about new message
  if (io) {
    io.to(`web-inbox:${widget.user_id}`).emit('web:new_message', {
      conversation_id: conversationId,
      message: {
        _id: visitorMsg._id,
        content: visitorMsg.content,
        direction: 'inbound',
        sender_type: 'visitor',
        created_at: visitorMsg.created_at,
      },
    });
  }

  const agentClaimed = !!conversation.assigned_agent_id;
  const visitorQueuedForHuman = conversation.status === 'human' && !agentClaimed;
  const botMayReply = conversation.status === 'bot' || visitorQueuedForHuman;

  if (botMayReply) {
    const shouldEscalate =
      conversation.status === 'bot' && widget.escalate_to_human && (await checkEscalation(conversation, widget));
    if (shouldEscalate) {
      conversation.status = 'human';
      await conversation.save();
      if (io) {
        io.of('/widget').to(room).emit('widget:escalate', { conversation_id: conversationId });
        io.to(`web-inbox:${widget.user_id}`).emit('web:escalated', { conversation_id: conversationId });
      }
      const holdMsg =
        'We’ve notified our team. Someone may join shortly — you can keep chatting here and our assistant will still try to help.';
      await emitBotReply(conversationId, holdMsg, room, io);
    }

    // Try automation engine first (flow-based widget trigger). Only boolean true = flow matched & ran.
    let flowMatched = false;
    try {
      const engine = await getAutomationEngine();
      const result = await engine.triggerEvent('widget_message_received', {
        message: content,
        userId: String(widget.user_id),
        conversationId: String(conversationId),
        visitorId: conversation.visitor_id,
        widgetConfigId: String(widget._id),
      });
      if (result === true) flowMatched = true;
    } catch (err) {
      console.error('Widget automation engine error:', err);
    }

    if (!flowMatched) {
      const aiReply = await generateBotReply(conversation, widget, content);
      if (aiReply) {
        await emitBotReply(conversationId, aiReply, room, io);
      }
    }
  }
  // status === 'human' && agentClaimed: only human agent replies via socket
}

export async function handleAgentReply({ conversationId, content, agentId, io }) {
  const conversation = await WebConversation.findById(conversationId);
  if (!conversation) throw new Error('Conversation not found');

  const agentMsg = await WebMessage.create({
    conversation_id: conversationId,
    direction: 'outbound',
    sender_type: 'agent',
    content,
    message_type: 'text',
  });

  conversation.last_message_at = new Date();
  conversation.unread_count = 0;
  conversation.last_message_content = content;
  conversation.last_message_type = 'text';
  conversation.last_message_direction = 'outbound';
  if (!conversation.assigned_agent_id && agentId) {
    conversation.assigned_agent_id = agentId;
  }
  await conversation.save();

  const room = `widget:${conversationId}`;
  if (io) {
    io.of('/widget').to(room).emit('widget:reply', {
      _id: agentMsg._id,
      content: agentMsg.content,
      direction: 'outbound',
      sender_type: 'agent',
      created_at: agentMsg.created_at,
    });
  }

  return agentMsg;
}

export async function emitBotReply(conversationId, content, room, io) {
  const botMsg = await WebMessage.create({
    conversation_id: conversationId,
    direction: 'outbound',
    sender_type: 'bot',
    content,
    message_type: 'text',
  });

  try {
    const conv = await WebConversation.findById(conversationId);
    if (conv) {
      conv.last_message_at = new Date();
      conv.last_message_content = content;
      conv.last_message_type = 'text';
      conv.last_message_direction = 'outbound';
      await conv.save();
    }
  } catch (_) {}

  if (io) {
    io.of('/widget').to(room).emit('widget:reply', {
      _id: botMsg._id,
      content: botMsg.content,
      direction: 'outbound',
      sender_type: 'bot',
      created_at: botMsg.created_at,
    });
  }
  return botMsg;
}

async function checkEscalation(conversation, widget) {
  const msgCount = await WebMessage.countDocuments({
    conversation_id: conversation._id,
    sender_type: 'visitor',
  });
  return msgCount >= widget.escalate_after_messages;
}

async function generateBotReply(conversation, widget, userMessage) {
  if (!widget.chatbot_id) return null;

  try {
    const chatbot = await Chatbot.findById(widget.chatbot_id).populate('ai_model');
    if (!chatbot || !chatbot.ai_model) return null;

    const recentMessages = await WebMessage.find({ conversation_id: conversation._id })
      .sort({ created_at: -1 })
      .limit(CONTEXT_WINDOW)
      .lean();

    const history = recentMessages.reverse().map(m => {
      const role = m.sender_type === 'visitor' ? 'Customer' : 'Assistant';
      return `${role}: ${m.content}`;
    }).join('\n');

    const systemPrompt = [
      chatbot.system_prompt || '',
      chatbot.business_name ? `Business: ${chatbot.business_name}` : '',
      chatbot.business_description || '',
      chatbot.raw_training_text || '',
    ].filter(Boolean).join('\n');

    const prompt = `${systemPrompt}\n\nConversation so far:\n${history}\n\nCustomer: ${userMessage}\nAssistant:`;

    const reply = await callAIModel(
      conversation.user_id,
      chatbot.ai_model,
      chatbot.api_key,
      prompt,
    );

    return reply?.trim() || null;
  } catch (err) {
    console.error('Widget bot reply error:', err);
    return null;
  }
}
