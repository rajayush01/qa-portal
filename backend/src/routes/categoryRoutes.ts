import { Router } from 'express';
import {
  listTaxonomy,
  createTaxonomyEntry,
  updateTaxonomyEntry,
  deleteTaxonomyEntry,
} from '../controllers/categoryController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, listTaxonomy);
router.post('/', requireAuth, requireRole('admin'), createTaxonomyEntry);
router.put('/:id', requireAuth, requireRole('admin'), updateTaxonomyEntry);
router.delete('/:id', requireAuth, requireRole('admin'), deleteTaxonomyEntry);

export default router;
