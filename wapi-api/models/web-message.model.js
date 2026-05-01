import mongoose from 'mongoose';

const webMessageSchema = new mongoose.Schema({
  conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WebConversation', required: true, index: true },
  direction: { type: String, enum: ['inbound', 'outbound'], required: true },
  sender_type: { type: String, enum: ['visitor', 'bot', 'agent'], required: true },
  content: { type: String, default: '' },
  message_type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('WebMessage', webMessageSchema);
