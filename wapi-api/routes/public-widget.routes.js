import express from 'express';
import WidgetConfig from '../models/widget-config.model.js';
import { getConfig, createOrResumeSession, getMessages } from '../controllers/public-widget.controller.js';

const router = express.Router();

async function widgetCors(req, res, next) {
  const apiKey = req.params.apiKey;
  const origin = req.headers.origin;

  try {
    const widget = await WidgetConfig.findOne({ api_key: apiKey, is_active: true }).select('allowed_domains').lean();
    if (!widget) return res.status(404).json({ success: false, message: 'Widget not found' });

    const allowed = widget.allowed_domains || [];
    if (allowed.length === 0 || allowed.includes('*') || allowed.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      return res.status(403).json({ success: false, message: 'Origin not allowed' });
    }
  } catch {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
}

router.use('/:apiKey', widgetCors);

router.get('/:apiKey/config', getConfig);
router.post('/:apiKey/session', createOrResumeSession);
router.get('/:apiKey/session/:visitorId/messages', getMessages);

export default router;
