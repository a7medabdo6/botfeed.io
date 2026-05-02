import mongoose from 'mongoose';

const chatbotMemorySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    session_key: {
      type: String,
      required: true,
      index: true
    },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    expires_at: {
      type: Date,
      required: true,
      index: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'chatbot_memories'
  }
);

chatbotMemorySchema.index({ session_key: 1, user_id: 1 }, { unique: true });
chatbotMemorySchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('ChatbotMemory', chatbotMemorySchema);
