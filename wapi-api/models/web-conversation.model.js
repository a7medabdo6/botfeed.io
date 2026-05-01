import mongoose from 'mongoose';

const webConversationSchema = new mongoose.Schema({
  widget_config_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WidgetConfig', required: true, index: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  visitor_id: { type: String, required: true, index: true },
  visitor_name: { type: String, default: '' },
  visitor_email: { type: String, default: '' },
  status: { type: String, enum: ['bot', 'human', 'closed'], default: 'bot' },
  assigned_agent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  metadata: {
    user_agent: { type: String, default: '' },
    referrer: { type: String, default: '' },
    page_url: { type: String, default: '' },
    ip: { type: String, default: '' },
  },
  last_message_at: { type: Date, default: Date.now },
  unread_count: { type: Number, default: 0 },
  is_pinned: { type: Boolean, default: false },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  chat_status: { type: String, enum: ['open', 'resolved'], default: 'open', index: true },
  last_message_content: { type: String, default: '' },
  last_message_type: { type: String, default: 'text' },
  last_message_direction: { type: String, enum: ['inbound', 'outbound'], default: 'inbound' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

webConversationSchema.index({ widget_config_id: 1, visitor_id: 1 }, { unique: true });
webConversationSchema.index({ is_pinned: 1 });
webConversationSchema.index({ tags: 1 });

export default mongoose.model('WebConversation', webConversationSchema);
