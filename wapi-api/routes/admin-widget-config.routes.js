import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import WidgetConfig from '../models/widget-config.model.js';
import WebConversation from '../models/web-conversation.model.js';

const router = express.Router();

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin only' });
  next();
}

router.get('/', authenticate, adminOnly, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.user_id) filter.user_id = req.query.user_id;
    if (req.query.is_active !== undefined) filter.is_active = req.query.is_active === 'true';

    const [data, total] = await Promise.all([
      WidgetConfig.find(filter).populate('user_id', 'name email').sort({ created_at: -1 }).skip(skip).limit(limit).lean(),
      WidgetConfig.countDocuments(filter),
    ]);

    const ids = data.map((d) => d._id);
    const stats = await WebConversation.aggregate([
      { $match: { widget_config_id: { $in: ids } } },
      { $group: { _id: '$widget_config_id', count: { $sum: 1 } } },
    ]);
    const statMap = Object.fromEntries(stats.map((s) => [s._id.toString(), s.count]));

    const enriched = data.map((d) => ({ ...d, conversation_count: statMap[d._id.toString()] || 0 }));

    return res.json({ success: true, data: enriched, pagination: { page, limit, total } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const config = await WidgetConfig.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!config) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: config });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await WidgetConfig.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
