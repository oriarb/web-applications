import { Router } from "express";
import {
  createComment,
  deleteComment,
  updateComment,
  getAllComments,
  getCommentsByPostId,
  getCommentsById,
  getCommentsBySender,
} from "../controllers/comments";

const router: Router = Router();

router.get("/", getAllComments);

router.post("/", createComment);

router.get("/id/:id", getCommentsById);
router.get("/post/:postId", getCommentsByPostId);
router.get("/sender/:sender", getCommentsBySender);

router.put("/:id", updateComment);
router.delete("/:id", deleteComment);

export default router;
