import { Router } from 'express';
import {
  getDashboardStats,
  listQuestions,
  getQuestionById,
  answerQuestion,
  markAnsweredInPerson,
  flagForLater,
  exportQuestions,
  getFacets,
} from '../controllers/adminController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/stats', getDashboardStats);
router.get('/facets', getFacets);
router.get('/questions/export', exportQuestions);
router.get('/questions/:questionId', getQuestionById);
router.post('/questions/:questionId/answer', answerQuestion);
router.post('/questions/:questionId/answer-in-person', markAnsweredInPerson);
router.post('/questions/:questionId/flag', flagForLater);
router.get('/questions', listQuestions);

export default router;
