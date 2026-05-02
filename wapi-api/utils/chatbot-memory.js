import { ChatbotMemory } from '../models/index.js';

const DEFAULT_WINDOW_SIZE = 20;
const DEFAULT_SESSION_HOURS = 24;

/**
 * Build a deterministic session key for a contact + chatbot pair.
 * For WhatsApp: "wa:{senderNumber}:{chatbotId}"
 * For widget:   "widget:{conversationId}:{chatbotId}"
 */
function buildSessionKey({ senderNumber, conversationId, chatbotId, channel }) {
  const botPart = chatbotId || 'default';
  if (channel === 'chatbot_widget' && conversationId) {
    return `widget:${conversationId}:${botPart}`;
  }
  return `wa:${senderNumber}:${botPart}`;
}

/**
 * Load recent conversation turns (Window Buffer Memory).
 * Returns an array of { role, content } suitable for OpenAI messages array.
 */
async function loadMemory({ userId, sessionKey, windowSize }) {
  const limit = windowSize || DEFAULT_WINDOW_SIZE;

  const doc = await ChatbotMemory.findOne({
    user_id: userId,
    session_key: sessionKey,
    expires_at: { $gt: new Date() }
  }).lean();

  if (!doc || !doc.messages || doc.messages.length === 0) {
    return [];
  }

  const msgs = doc.messages.slice(-limit);
  return msgs.map(m => ({ role: m.role, content: m.content }));
}

/**
 * Save a user+assistant turn pair to memory.
 * Keeps the window within bounds and extends the session TTL.
 */
async function saveMemory({ userId, sessionKey, userMessage, assistantMessage, windowSize, sessionHours }) {
  const limit = windowSize || DEFAULT_WINDOW_SIZE;
  const ttlHours = sessionHours || DEFAULT_SESSION_HOURS;
  const expiresAt = new Date(Date.now() + ttlHours * 3600000);
  const now = new Date();

  const newMessages = [
    { role: 'user', content: userMessage, timestamp: now },
    { role: 'assistant', content: assistantMessage, timestamp: now }
  ];

  const doc = await ChatbotMemory.findOneAndUpdate(
    { user_id: userId, session_key: sessionKey },
    {
      $push: { messages: { $each: newMessages, $slice: -limit } },
      $set: { expires_at: expiresAt }
    },
    { upsert: true, new: true }
  );

  return doc;
}

/**
 * Clear memory for a session (e.g. when conversation is reset).
 */
async function clearMemory({ userId, sessionKey }) {
  await ChatbotMemory.deleteOne({ user_id: userId, session_key: sessionKey });
}

export {
  buildSessionKey,
  loadMemory,
  saveMemory,
  clearMemory,
  DEFAULT_WINDOW_SIZE,
  DEFAULT_SESSION_HOURS
};
