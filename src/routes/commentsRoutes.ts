import { Router } from 'express';
import {
  createComment,
  deleteComment,
  getComments,
  getCommentsById,
  updateComment,
} from '../controllers/comments';
import { authMiddleware } from '../common/auth-middleware';

const router: Router = Router();

router.get('/', authMiddleware, getComments);

router.post('/', authMiddleware, createComment);

router.get('/:id', authMiddleware, getCommentsById);

router.put('/update', authMiddleware, updateComment);

router.delete('/delete/:id', authMiddleware, deleteComment);

export default router;
