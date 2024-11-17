import { Request, Response } from "express";
import { Comment, IComment } from "../models/comment.model";
import { Types } from "mongoose";

const sendSuccessResponse = (
  res: Response,
  data: any,
  statusCode: number = 200,
  message?: string
) => {
  console.log(message || "Success:", data);
  res.status(statusCode).json(data);
};

const sendErrorResponse = (
  res: Response,
  errorMessage: string,
  statusCode: number = 500
) => {
  console.error("Error:", errorMessage);
  res.status(statusCode).json({ error: errorMessage });
};

const isValidObjectId = (id: string): boolean => {
  return Types.ObjectId.isValid(id);
};

export const getAllComments = async (req: Request, res: Response) => {
  try {
    const comments: IComment[] = await Comment.find();
    if (comments.length === 0) {
      return sendErrorResponse(res, "No comments found", 404);
    }
    sendSuccessResponse(
      res,
      comments,
      200,
      "All comments retrieved successfully."
    );
  } catch (error: any) {
    sendErrorResponse(res, error.message);
  }
};

export const getCommentsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendErrorResponse(res, "Invalid comment ID", 400);
    }

    const comment: IComment | null = await Comment.findById(id);
    if (!comment) {
      return sendErrorResponse(res, "Comment not found", 404);
    }

    sendSuccessResponse(
      res,
      comment,
      200,
      `Comment with ID ${id} retrieved successfully.`
    );
  } catch (error: any) {
    sendErrorResponse(res, error.message);
  }
};

export const getCommentsByPostId = async (req: Request, res: Response) => {
  try {
    const { postId } = req.body;
    if (!isValidObjectId(postId)) {
      return sendErrorResponse(res, "Invalid post ID", 400);
    }

    const comments: IComment[] = await Comment.find({ postId });
    sendSuccessResponse(
      res,
      comments,
      200,
      `Comments for post ID ${postId} retrieved successfully.`
    );
  } catch (error: any) {
    sendErrorResponse(res, error.message);
  }
};

export const getCommentsBySender = async (req: Request, res: Response) => {
  try {
    const { sender } = req.body;

    const comments: IComment[] = await Comment.find({ sender });

    sendSuccessResponse(
      res,
      comments,
      200,
      `Comments by sender ${sender} retrieved successfully.`
    );
  } catch (error: any) {
    sendErrorResponse(res, error.message);
  }
};

export const createComment = async (req: Request, res: Response) => {
  const { postId, message, sender } = req.body;
  try {
    if (!isValidObjectId(postId)) {
      return sendErrorResponse(res, "Invalid post ID", 400);
    }

    const comment: IComment = new Comment({
      postId: postId,
      message,
      sender,
    });
    await comment.save();
    sendSuccessResponse(
      res,
      comment,
      201,
      `Comment created successfully for post ID ${postId}.`
    );
  } catch (error: any) {
    sendErrorResponse(res, error.message);
  }
};

export const updateComment = async (req: Request, res: Response) => {
  const { id, message, sender } = req.body;
  try {
    const comment: IComment | null = await Comment.findByIdAndUpdate(
      id,
      { message, sender },
      { new: true }
    );
    if (!comment) {
      return sendErrorResponse(res, "Comment not found", 404);
    }
    sendSuccessResponse(
      res,
      comment,
      200,
      `Comment with ID ${id} updated successfully.`
    );
  } catch (error: any) {
    sendErrorResponse(res, error.message);
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  const { id } = req.body;
  try {
    const comment: IComment | null = await Comment.findByIdAndDelete(id);
    if (!comment) {
      return sendErrorResponse(res, "Comment not found", 404);
    }
    sendSuccessResponse(
      res,
      comment,
      200,
      `Comment with ID ${id} deleted successfully.`
    );
  } catch (error: any) {
    sendErrorResponse(res, error.message);
  }
};
