import { Router } from "express";
import {
  createComment,
  deleteComment,
  updateComment,
  getCommentsById,
  getComments,
} from "../controllers/comments";

const router: Router = Router();

router.get("/", getComments);

router.post("/", createComment);

router.get("/:id", getCommentsById);

router.put("/update", updateComment);
router.delete("/delete/:id", deleteComment);

export default router;
