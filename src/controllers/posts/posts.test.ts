import mongoose from 'mongoose';
import request from 'supertest';
import { Post } from '../../models/post.model';
import app from '../../app';
import dotenv from 'dotenv';
import { createUser, testLogin } from '../../utils/createUser';
import { User } from '../../models/user.model';

dotenv.config({ path: '.env.test' });

const dbUrl: string = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

describe('Posts API', () => {
  let createdPostId: string;
  let testUserToken: string;
  beforeAll(async () => {
    try {
      await mongoose.connect(dbUrl);
      console.log('Connected to test database');
      await createUser(
        'test@example.com',
        'password123',
        'testuser',
        'Test User',
      );
      const response = await testLogin('test@example.com', 'password123');
      testUserToken = response.body.accessToken;

    } catch (error) {
        console.error('Error connecting to test database:', error);
        process.exit(1);
      }
  })

  afterAll(async () => {
    try {
      await Post.deleteMany({});
      await User.deleteMany({});
      await mongoose.connection.close();
      console.log('Database connection closed');
     } catch (error) {
        console.error('Error closing database connection:', error);
        process.exit(1);
      }
  });

  beforeEach(async () => {
    const postResponse = await request(app)
      .post("/posts")
      .send({
        message: "YALLA HAPOEL",
        sender: "OR"
      })
      .set('Authorization', `JWT ${testUserToken}`);
    createdPostId = postResponse.body._id;
  });

  test("getAllPosts - should return an empty array initially", async () => {
    await Post.deleteMany({});
    const response = await request(app).get("/posts").set('Authorization', `JWT ${testUserToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("createPost - should create a new post", async () => {
    const postPayload = {
      message: "NEW POST",
      sender: "OR",
    };

    const response = await request(app).post("/posts").send(postPayload).set('Authorization', `JWT ${testUserToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.message).toBe(postPayload.message);
    expect(response.body.sender).toBe(postPayload.sender);
  });

  test("getAllPosts - should return an array with posts", async () => {
    const response = await request(app).get("/posts?sender=OR").set('Authorization', `JWT ${testUserToken}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].sender).toBe("OR");
  });

  test("createPost - should return error when message is missing", async () => {
    const response = await request(app).post("/posts").send({
      sender: "OR",
    }).set('Authorization', `JWT ${testUserToken}`);
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error", "Message is required");
  });

  test("getPostById - should return the post by ID", async () => {
    const response = await request(app).get(`/posts/${createdPostId}`).set('Authorization', `JWT ${testUserToken}`);
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
      .send(updatedPayload)
      .set('Authorization', `JWT ${testUserToken}`);
    
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
      .send(updatedPayload)
      .set('Authorization', `JWT ${testUserToken}`);

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
    
    const response = await request(app).get("/posts").set('Authorization', `JWT ${testUserToken}`);
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error", "Database error");
    
    mockFind.mockRestore();
  });

  test("getPostById - should handle invalid ID format", async () => {
    const response = await request(app).get("/posts/invalid-id").set('Authorization', `JWT ${testUserToken}`);
    expect(response.status).toBe(500);
  });

  test("getPostById - should handle non-existent post", async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const response = await request(app).get(`/posts/${nonExistentId}`).set('Authorization', `JWT ${testUserToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toBeNull();
  });

  test("updatePost - should handle validation error", async () => {
    const response = await request(app)
      .put(`/posts/${createdPostId}`)
      .send({
        sender: "ORI"
      })
      .set('Authorization', `JWT ${testUserToken}`);
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error", "Message is required");
  });
});
