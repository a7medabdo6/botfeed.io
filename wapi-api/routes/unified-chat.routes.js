import express from 'express';
import multer from 'multer';
import * as uc from '../controllers/unified-chat.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/permission.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const perm = checkPermission('manage.conversations');

router.get('/unified', authenticate, perm, uc.getUnifiedChats);

router.get('/web/messages/:conversationId', authenticate, perm, uc.getWebMessages);
router.post('/web/send', authenticate, perm, upload.single('file_url'), uc.sendWebMessage);
router.get('/web/profile/:conversationId', authenticate, perm, uc.getWebChatProfile);
router.get('/web/notes/:conversationId', authenticate, perm, uc.getWebNotes);

router.post('/web/pin', authenticate, perm, uc.toggleWebPin);
router.post('/web/tag', authenticate, perm, uc.addWebTag);
router.delete('/web/tag', authenticate, perm, uc.deleteWebTag);
router.post('/web/note', authenticate, perm, uc.addWebNote);
router.delete('/web/note', authenticate, perm, uc.deleteWebNote);
router.post('/web/assign', authenticate, perm, uc.assignWebChat);
router.post('/web/unassign', authenticate, perm, uc.unassignWebChat);
router.post('/web/status', authenticate, perm, uc.updateWebChatStatus);
router.post('/web/delete', authenticate, perm, uc.deleteWebChat);

export default router;
