import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { requireSubscription, requirePlanFeature } from '../middlewares/plan-permission.js';
import { checkPermission } from '../middlewares/permission.js';
import * as ctrl from '../controllers/funnel-page.controller.js';

const router = express.Router();

router.use(authenticate);
router.use(requireSubscription);
router.use(
  requirePlanFeature('chatbot_widget', {
    message:
      'Funnel pages require the Chatbot widget feature on the account\'s subscription plan. Enable "chatbot widget" for their plan in wapi-admin → Subscriber plans (or Plans), then try again.',
  }),
);

router.get('/', checkPermission('view.funnel_pages'), ctrl.list);
router.post('/', checkPermission('create.funnel_pages'), ctrl.create);
router.patch('/:id/publish', checkPermission('update.funnel_pages'), ctrl.publish);
router.get('/:id/analytics', checkPermission('view.funnel_pages'), ctrl.getAnalytics);
router.get('/:id/versions', checkPermission('view.funnel_pages'), ctrl.listVersions);
router.get('/:id', checkPermission('view.funnel_pages'), ctrl.getById);
router.put('/:id', checkPermission('update.funnel_pages'), ctrl.update);
router.delete('/:id', checkPermission('delete.funnel_pages'), ctrl.remove);

export default router;
