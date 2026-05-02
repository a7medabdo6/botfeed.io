import express from 'express';
import { transformMessage, suggestReply, getSupportedLanguages } from '../controllers/ai-assistance.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { requireSubscription, checkPlanLimit } from '../middlewares/plan-permission.js';
import { checkPermission } from '../middlewares/permission.js';
const router = express.Router();

router.use(authenticate);
router.use(requireSubscription);

router.post('/transform', checkPlanLimit('ai_prompts'), checkPermission('create.ai_prompts'), transformMessage);
router.post('/suggest-reply', checkPlanLimit('ai_prompts'), checkPermission('create.ai_prompts'), suggestReply);

router.get('/languages', checkPermission('view.languages'), getSupportedLanguages);

export default router;
