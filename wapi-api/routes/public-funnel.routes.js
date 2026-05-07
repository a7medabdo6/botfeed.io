import express from 'express';
import * as ctrl from '../controllers/funnel-page.controller.js';

const router = express.Router();

function analyticsCors(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
}

router.get('/w/:workspaceSlug/:funnelSlug', ctrl.getPublicByWorkspace);
router.options('/:publicId/analytics', analyticsCors);
router.post('/:publicId/analytics', analyticsCors, ctrl.recordAnalytics);
router.get('/:publicId', ctrl.getPublic);

export default router;
