import { Schema, model, Document, Types } from "mongoose";

export interface IComment extends Document {
  postId: Types.ObjectId;
  message: string;
  sender: string;
}

const commentSchema = new Schema<IComment>(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    message: { type: String, required: true },
    sender: { type: String, required: true },
  },
  { timestamps: true }
);

export const Comment = model<IComment>("Comment", commentSchema);
