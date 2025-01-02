import { Router } from 'express';
import {
  createComment,
  deleteComment,
  getComments,
  getCommentsById,
  getComments,
} from "../controllers/comments/comments";
import { authMiddleware } from '../common/auth-middleware';


const router: Router = Router();

/**
 * @swagger
 * /comments:
 *   get:
 *     description: Get all comments
 *     responses:
 *       200:
 *         description: A list of comments
 */
router.get("/", authMiddleware, getComments);

/**
 * @swagger
 * /comments:
 *   post:
 *     description: Create a new comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               postId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created successfully
 */
router.post("/", authMiddleware, createComment);

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     description: Get a comment by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the comment
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A comment by ID
 */
router.get("/:id", authMiddleware, getCommentsById);

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     description: Update a comment by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the comment
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
 *         description: Comment updated successfully
 */
router.put("/:id", authMiddleware, updateComment);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     description: Delete a comment by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the comment
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 */
router.delete("/:id", authMiddleware, deleteComment);

export default router;
