import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import * as ctrl from '../controllers/widget-config.controller.js';

const router = express.Router();

router.get('/conversations/list', authenticate, ctrl.getConversations);
router.get('/conversations/:conversationId/messages', authenticate, ctrl.getConversationMessages);
router.post('/conversations/:conversationId/reply', authenticate, ctrl.replyToConversation);

router.get('/', authenticate, ctrl.list);
router.post('/', authenticate, ctrl.create);
router.get('/:id', authenticate, ctrl.getById);
router.put('/:id', authenticate, ctrl.update);
router.delete('/:id', authenticate, ctrl.remove);

export default router;
