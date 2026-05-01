import mongoose from 'mongoose';

const webMessageSchema = new mongoose.Schema({
  conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WebConversation', required: true, index: true },
  direction: { type: String, enum: ['inbound', 'outbound'], required: true },
  sender_type: { type: String, enum: ['visitor', 'bot', 'agent'], required: true },
  content: { type: String, default: '' },
  message_type: { type: String, enum: ['text', 'image', 'video', 'audio', 'document', 'file', 'location', 'system_messages'], default: 'text' },
  file_url: { type: String, default: null },
  file_type: { type: String, default: null },
  from_me: { type: Boolean, default: false },
  reply_message_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WebMessage', default: null },
  delivery_status: { type: String, enum: ['pending', 'sent', 'delivered', 'read', 'failed'], default: 'sent' },
  read_status: { type: String, enum: ['unread', 'read'], default: 'unread' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

webMessageSchema.index({ conversation_id: 1, created_at: -1 });

export default mongoose.model('WebMessage', webMessageSchema);
