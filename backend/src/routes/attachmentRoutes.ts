import { Router } from 'express';
import { downloadAttachment } from '../controllers/attachmentController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/:questionId/:fileName', requireAuth, downloadAttachment);

export default router;
