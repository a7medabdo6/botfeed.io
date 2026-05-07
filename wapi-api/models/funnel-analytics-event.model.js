import mongoose from 'mongoose';

const funnelAnalyticsEventSchema = new mongoose.Schema(
  {
    funnel_page_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FunnelPage', required: true, index: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    event_type: { type: String, enum: ['view', 'cta_click'], required: true, index: true },
    ab_variant: { type: String, enum: ['A', 'B'], default: undefined },
    path: { type: String, default: '' },
    referrer: { type: String, default: '' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false }, collection: 'funnel_analytics_events' }
);

funnelAnalyticsEventSchema.index({ funnel_page_id: 1, created_at: -1 });

export default mongoose.model('FunnelAnalyticsEvent', funnelAnalyticsEventSchema);
