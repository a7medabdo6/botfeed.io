import express from 'express';
import * as chatController from '../controllers/chat.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import { requireSubscription, checkPlanLimit } from '../middlewares/plan-permission.js';
import { checkPermission } from '../middlewares/permission.js';

const router = express.Router();

router.use(authenticate);
router.use(requireSubscription);

router.get('/all', checkPermission('manage.conversations'), chatController.getRecentChats);
router.post('/add-tag', checkPermission('manage.conversations'), chatController.addTag);
router.delete('/delete-tag', checkPermission('manage.conversations'), chatController.deleteTag);
router.post('/add-note', checkPermission('manage.conversations'), chatController.addNote);
router.delete('/delete-note', checkPermission('manage.conversations'), chatController.deleteNote);
router.post('/assign', checkPermission('manage.conversations'), chatController.assignChatToAgent);
router.post('/unassign', checkPermission('manage.conversations'), chatController.unassignChatFromAgent);
router.post('/status', checkPlanLimit('conversations'), checkPermission('manage.conversations'), chatController.updateChatStatus);

export default router;

