import { Schema, model, Document } from "mongoose";

export interface IPost extends Document {
    message: string;
    sender: string;
}

const postSchema = new Schema<IPost>({
    message: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    }
});

export const Post = model<IPost>('Post', postSchema);