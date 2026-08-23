import { Router } from 'express';
import { createQuestion, getMyQuestions, getMyQuestionById } from '../controllers/questionController';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(requireAuth);

router.post('/', upload.array('attachments'), createQuestion);
router.get('/my', getMyQuestions);
router.get('/:questionId', getMyQuestionById);

export default router;
