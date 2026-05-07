import mongoose from 'mongoose';
import crypto from 'crypto';

const funnelPageSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    public_id: { type: String, unique: true, sparse: true, trim: true },
    slug: { type: String, required: true, trim: true, maxlength: 128 },
    title: { type: String, required: true, trim: true, maxlength: 256 },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    blocks: { type: [mongoose.Schema.Types.Mixed], default: [] },
    whatsapp_widget_config_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WidgetConfig', default: null },
    chatbot_widget_config_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WidgetConfig', default: null },
    workspace_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', default: null, index: true },
    /** Target hostname for future custom-domain routing (DNS verification not implemented here). */
    custom_domain: { type: String, trim: true, lowercase: true, maxlength: 253, default: null },
    ab_test_enabled: { type: Boolean, default: false },
    ab_blocks_b: { type: [mongoose.Schema.Types.Mixed], default: [] },
    ab_traffic_a_percent: { type: Number, default: 50, min: 1, max: 99 },
    deleted_at: { type: Date, default: null, index: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'funnel_pages' }
);

funnelPageSchema.index(
  { user_id: 1, slug: 1 },
  {
    unique: true,
    partialFilterExpression: {
      deleted_at: null,
      $or: [{ workspace_id: null }, { workspace_id: { $exists: false } }],
    },
  }
);
funnelPageSchema.index(
  { workspace_id: 1, slug: 1 },
  { unique: true, partialFilterExpression: { deleted_at: null, workspace_id: { $ne: null } } }
);

funnelPageSchema.pre('save', function () {
  if (!this.public_id) {
    this.public_id = 'fp_' + crypto.randomBytes(16).toString('hex');
  }
});

export default mongoose.model('FunnelPage', funnelPageSchema);
