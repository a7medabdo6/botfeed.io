import mongoose from 'mongoose';

const funnelPageVersionSchema = new mongoose.Schema(
  {
    funnel_page_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FunnelPage', required: true, index: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    version: { type: Number, required: true, min: 1 },
    snapshot: {
      title: String,
      slug: String,
      blocks: [mongoose.Schema.Types.Mixed],
      ab_test_enabled: Boolean,
      ab_blocks_b: [mongoose.Schema.Types.Mixed],
      ab_traffic_a_percent: Number,
      whatsapp_widget_config_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WidgetConfig' },
      chatbot_widget_config_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WidgetConfig' },
      workspace_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
      custom_domain: String,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false }, collection: 'funnel_page_versions' }
);

funnelPageVersionSchema.index({ funnel_page_id: 1, version: 1 }, { unique: true });

export default mongoose.model('FunnelPageVersion', funnelPageVersionSchema);
