import { Router } from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
} from "../controllers/posts/posts";

const router = Router();

/**
 * @swagger
 * /posts:
 *   get:
 *     description: Get all posts
 *     responses:
 *       200:
 *         description: A list of posts
 */
router.get("/", getAllPosts);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     description: Get a post by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the post
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A post by ID
 */
router.get("/:id", getPostById);

/**
 * @swagger
 * /posts:
 *   post:
 *     description: Create a new post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               sender:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 */
router.post("/", createPost);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     description: Update a post by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the post
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               sender:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated successfully
 */
router.put("/:id", updatePost);

export default router;
