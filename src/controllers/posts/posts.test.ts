import { appPromise } from "../../appPromise";
import mongoose from "mongoose";
import { Post } from "../../models/post.model";
import { Application } from "express";
import request from "supertest";

var app: Application;

beforeAll(async () => {
  app = await appPromise;
  await Post.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Posts API", () => {
  let createdPostId: string;

  test("getAllPosts - should return an empty array initially", async () => {
    const response = await request(app).get("/posts");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });


  test("createPost - should create a new post", async () => {
    const postPayload = {
      message: "YALLA HAPOEL",
      sender: "OR",
    };

    const response = await request(app).post("/posts").send(postPayload);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.message).toBe(postPayload.message);
    expect(response.body.sender).toBe(postPayload.sender);

    createdPostId = response.body._id;
  });

  test("getAllPosts - should return an array with the created post", async () => {
    const response = await request(app).get("/posts?sender=OR");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([expect.objectContaining(postPayload)]);
  });

  test("createPost - should return error when message is missing", async () => {
    const response = await request(app).post("/posts").send({
      sender: "OR",
    });
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error", "Message is required");
  });

  test("getAllPosts - should return the created post", async () => {
    const response = await request(app).get("/posts");
    console.log(response);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toHaveProperty("_id", createdPostId);
  });

  test("getPostById - should return the post by ID", async () => {
    const response = await request(app).get(`/posts/${createdPostId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("_id", createdPostId);
  });

  test("updatePost - should log success message (lines 68-69)", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    const updatedPayload = {
      message: "RAK HAPOEL",
      sender: "ORI",
    };

    const response = await request(app)
      .put(`/posts/${createdPostId}`)
      .send(updatedPayload);
    expect(response.status).toBe(200);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Post updated successfully: ",
      expect.objectContaining({
        message: updatedPayload.message,
        sender: updatedPayload.sender,
      })
    );

    consoleSpy.mockRestore();
  });

  test("updatePost - should update the post by ID", async () => {
    const updatedPayload = {
      message: "RAK HAPOEL",
      sender: "ORI",
    };

    const response = await request(app)
      .put(`/posts/${createdPostId}`)
      .send(updatedPayload);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("_id", createdPostId);
    expect(response.body.message).toBe(updatedPayload.message);
  });

  test("getPostById - should return the updated post", async () => {
    const response = await request(app).get(`/posts/${createdPostId}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("RAK HAPOEL");
  });

  test("getAllPosts - should filter posts by sender", async () => {
    const response = await request(app).get(`/posts?sender=ORI`);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0]).toHaveProperty("sender", "ORI");
  });
});
