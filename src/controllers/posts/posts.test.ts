import { Application } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../../createApp';
import { Post } from '../../models/post.model';

describe('Posts API', () => {
  let app: Application;
  let mongoServer: MongoMemoryServer;
  let createdPostId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    app = await createApp({
      DB_URL: mongoUri
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Post.deleteMany({});
    const postResponse = await request(app)
      .post("/posts")
      .send({
        message: "YALLA HAPOEL",
        sender: "OR"
      });
    createdPostId = postResponse.body._id;
  });

  test("getAllPosts - should return an empty array initially", async () => {
    await Post.deleteMany({});
    const response = await request(app).get("/posts");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("createPost - should create a new post", async () => {
    const postPayload = {
      message: "NEW POST",
      sender: "OR",
    };

    const response = await request(app).post("/posts").send(postPayload);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.message).toBe(postPayload.message);
    expect(response.body.sender).toBe(postPayload.sender);
  });

  test("getAllPosts - should return an array with posts", async () => {
    const response = await request(app).get("/posts?sender=OR");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].sender).toBe("OR");
  });

  test("createPost - should return error when message is missing", async () => {
    const response = await request(app).post("/posts").send({
      sender: "OR",
    });
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error", "Message is required");
  });

  test("getPostById - should return the post by ID", async () => {
    const response = await request(app).get(`/posts/${createdPostId}`);
    expect(response.status).toBe(200);
    expect(response.body).toBeTruthy();
    expect(response.body._id).toBe(createdPostId);
  });

  test("updatePost - should update the post", async () => {
    const updatedPayload = {
      message: "RAK HAPOEL",
      sender: "ORI",
    };

    const response = await request(app)
      .put(`/posts/${createdPostId}`)
      .send(updatedPayload);
    
    expect(response.status).toBe(200);
    expect(response.body).toBeTruthy();
    expect(response.body._id).toBe(createdPostId);
    expect(response.body.message).toBe(updatedPayload.message);
    expect(response.body.sender).toBe(updatedPayload.sender);
  });

  test("updatePost - should log success message", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    const updatedPayload = {
      message: "RAK HAPOEL",
      sender: "ORI",
    };

    await request(app)
      .put(`/posts/${createdPostId}`)
      .send(updatedPayload);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Post updated successfully: ",
      expect.objectContaining({
        message: "RAK HAPOEL",
        sender: "ORI"
      })
    );

    consoleSpy.mockRestore();
  });

  test("getAllPosts - should handle database error", async () => {
    const mockFind = jest.spyOn(Post, 'find').mockRejectedValueOnce(new Error("Database error"));
    
    const response = await request(app).get("/posts");
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error", "Database error");
    
    mockFind.mockRestore();
  });

  test("getPostById - should handle invalid ID format", async () => {
    const response = await request(app).get("/posts/invalid-id");
    expect(response.status).toBe(500);
  });

  test("getPostById - should handle non-existent post", async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const response = await request(app).get(`/posts/${nonExistentId}`);
    expect(response.status).toBe(200);
    expect(response.body).toBeNull();
  });

  test("updatePost - should handle validation error", async () => {
    const response = await request(app)
      .put(`/posts/${createdPostId}`)
      .send({
        sender: "ORI"
      });
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error", "Message is required");
  });
});
