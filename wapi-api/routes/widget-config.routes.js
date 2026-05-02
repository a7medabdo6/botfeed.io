import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { requireSubscription, requirePlanFeature } from '../middlewares/plan-permission.js';
import * as ctrl from '../controllers/widget-config.controller.js';

const router = express.Router();

router.use(authenticate);
router.use(requireSubscription);
router.use(requirePlanFeature('chatbot_widget'));

router.get('/conversations/list', ctrl.getConversations);
router.get('/conversations/:conversationId/messages', ctrl.getConversationMessages);
router.post('/conversations/:conversationId/reply', ctrl.replyToConversation);

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getById);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;
