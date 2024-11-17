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
router.get("/post/", getCommentsByPostId);
router.get("/sender/", getCommentsBySender);

router.put("/update", updateComment);
router.delete("/delete", deleteComment);

export default router;
