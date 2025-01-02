import {Router} from "express";
import {createPost, getAllPosts, getPostById, updatePost} from '../controllers/posts';
import { authMiddleware } from '../common/auth-middleware';


const router: Router = Router();

router.get('/', authMiddleware, getAllPosts);

router.get('/:id',authMiddleware , getPostById);

router.post('/', authMiddleware, createPost);

router.put('/:id', authMiddleware, updatePost);

export default router;
