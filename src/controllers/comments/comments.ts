import { Request, Response } from "express";
import { Comment, IComment } from "../../models/comment.model";
import mongoose, { Types } from "mongoose";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../../functions/responseFunctions";

const isValidObjectId = (id: string): boolean => {
  return Types.ObjectId.isValid(id);
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const { postId, sender } = req.query;
    const filter: mongoose.FilterQuery<IComment> = {};

    if (sender) filter.sender = sender as string;

    if (postId) {
      if (isValidObjectId(postId as string)) {
        filter.postId = new mongoose.Types.ObjectId(postId as string);
      } else {
        return sendErrorResponse(res, "Invalid post ID", 400);
      }
    }

    const comments = await Comment.find(filter).lean();
    sendSuccessResponse(res, comments, 200, "Comments retrieved successfully.");
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
  const { id } = req.params;
  const { message, sender } = req.body;
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
  const { id } = req.params;
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
