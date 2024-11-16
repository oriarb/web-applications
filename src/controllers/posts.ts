import { Request, Response } from "express";
import { IPost, Post } from "../models/post.model";

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    let posts: IPost[] = [];

    if (req.query.sender) {
      const sender = req.query.sender;
      posts = await Post.find({ sender });
    } else {
      posts = await Post.find();
    }

    console.log("Posts retrieved successfully: ", posts);
    res.json(posts);
  } catch (error: any) {
    console.error("Error retrieving posts: ", error.message);
    res.json({ error: error.message });
  }
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const { message, sender } = req.body;
    const post: IPost = new Post({ message, sender });
    await post.save();

    console.log("Post created successfully: ", post);
    res.json(post);
  } catch (error: any) {
    console.error("Error creating post: ", error.message);
    res.json({ error: error.message });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    console.log("Post retrieved successfully: ", post);
    res.json(post);
  } catch (error: any) {
    console.error("Error retrieving post: ", error.message);
    res.json({ error: error.message });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message, sender } = req.body;
    const post = await Post.findByIdAndUpdate(
      id,
      { message, sender },
      { new: true }
    );

    console.log("Post updated successfully: ", post);
    res.json(post);
  } catch (error: any) {
    console.error("Error updating post: ", error.message);
    res.json({ error: error.message });
  }
};
