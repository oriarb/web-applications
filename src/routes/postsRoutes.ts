import {Router} from "express";
import {createPost, getAllPosts, getPostById, updatePost} from "../controllers/posts";

const router = Router();

router.get('/', getAllPosts);

router.get('/:id', getPostById);

router.post('/', createPost);

router.put('/:id', updatePost);

export default router;