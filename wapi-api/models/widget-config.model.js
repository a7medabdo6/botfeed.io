import mongoose from 'mongoose';
import crypto from 'crypto';

const widgetConfigSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true, default: 'My Widget' },
  mode: { type: String, enum: ['whatsapp', 'chatbot', 'both'], default: 'both' },

  // WhatsApp settings
  whatsapp_number: { type: String, default: '' },
  prefill_message: { type: String, default: 'Hi! I have a question.' },
  wa_style: { type: String, enum: ['click_to_chat', 'inline_form', 'both'], default: 'click_to_chat' },

  // Chatbot settings
  chatbot_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Chatbot', default: null },
  welcome_message: { type: String, default: 'Hello! How can we help you today?' },
  placeholder_text: { type: String, default: 'Type a message…' },
  escalate_to_human: { type: Boolean, default: true },
  escalate_after_messages: { type: Number, default: 10 },

  // Appearance
  primary_color: { type: String, default: '#0ea5e9' },
  position: { type: String, enum: ['left', 'right'], default: 'right' },
  bubble_icon: { type: String, default: 'chat' },
  title: { type: String, default: 'Chat with us' },
  subtitle: { type: String, default: 'We usually reply within minutes' },

  // Auth / security
  api_key: { type: String, unique: true, index: true },
  allowed_domains: { type: [String], default: [] },

  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

widgetConfigSchema.pre('save', function () {
  if (!this.api_key) {
    this.api_key = 'wk_' + crypto.randomBytes(24).toString('hex');
  }
});

export default mongoose.model('WidgetConfig', widgetConfigSchema);
