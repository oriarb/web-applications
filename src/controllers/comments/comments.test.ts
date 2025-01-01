import { Application } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../../createApp';
import { Comment } from '../../models/comment.model';

describe('Comments API', () => {
  let app: Application;
  let mongoServer: MongoMemoryServer;
  let testPostId: string;
  let createdCommentId: string;

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
    await Comment.deleteMany({});
    
    const postResponse = await request(app)
      .post('/posts')
      .send({
        message: 'Test Post',
        sender: 'Test Author'
      });
    testPostId = postResponse.body._id;

    const commentResponse = await request(app)
      .post('/comments')
      .send({
        postId: testPostId,
        message: 'Test Comment',
        sender: 'Test User'
      });
    createdCommentId = commentResponse.body._id;
  });

  describe('POST /comments', () => {
    test('should create a new comment', async () => {
      const commentPayload = {
        postId: testPostId,
        message: 'New Comment',
        sender: 'New User'
      };

      const response = await request(app)
        .post('/comments')
        .send(commentPayload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.message).toBe(commentPayload.message);
      expect(response.body.sender).toBe(commentPayload.sender);
    });

    test('should return error when message is missing', async () => {
      const response = await request(app)
        .post('/comments')
        .send({
          postId: testPostId,
          sender: 'Test User'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Comment validation failed: message: Path `message` is required.');
    });

    test('should return error when postId is invalid', async () => {
      const response = await request(app)
        .post('/comments')
        .send({
          postId: 'invalid-id',
          message: 'Test Comment',
          sender: 'Test User'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /comments', () => {
    test('should get all comments', async () => {
      const response = await request(app).get('/comments');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
    });

    test('should filter comments by postId', async () => {
      const response = await request(app)
        .get(`/comments?postId=${testPostId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].postId).toBe(testPostId);
    });

    test('should filter comments by sender', async () => {
      const response = await request(app)
        .get('/comments?sender=Test User');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].sender).toBe('Test User');
    });

    test('should handle database error', async () => {
      const mockFind = jest.spyOn(Comment, 'find').mockReturnValueOnce({
        lean: jest.fn().mockRejectedValueOnce(new Error('Database error'))
      } as any);
    
      const response = await request(app).get('/comments');
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Database error');
    
      mockFind.mockRestore();
    });

    test('should return error when postId is invalid', async () => {
      const response = await request(app)
        .get('/comments?postId=invalid-id');
  
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid post ID');
    });
  });

  describe('GET /comments/:id', () => {
    test('should get comment by id', async () => {
      const response = await request(app)
        .get(`/comments/${createdCommentId}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeTruthy();
      expect(response.body._id).toBe(createdCommentId);
    });

    test('should handle invalid id format', async () => {
      const response = await request(app)
        .get('/comments/invalid-id');

      expect(response.status).toBe(400);
    });

    test('should handle database error', async () => {
      const mockFindById = jest.spyOn(Comment, 'findById').mockRejectedValueOnce(new Error('Database error'));
  
      const response = await request(app)
        .get(`/comments/${createdCommentId}`);
  
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Database error');
  
      mockFindById.mockRestore();
    });

    test('should handle non-existent comment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .get(`/comments/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Comment not found');
    });
  });

  describe('PUT /comments/:id', () => {
    test('should update comment', async () => {
      const updatedPayload = {
        message: 'Updated Comment',
        sender: 'Updated User'
      };

      const response = await request(app)
        .put(`/comments/${createdCommentId}`)
        .send(updatedPayload);

      expect(response.status).toBe(200);
      expect(response.body).toBeTruthy();
      expect(response.body._id).toBe(createdCommentId);
      expect(response.body.message).toBe(updatedPayload.message);
      expect(response.body.sender).toBe(updatedPayload.sender);
    });

    test('should handle non-existent comment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .get(`/comments/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Comment not found');
    });

    test('should log success message', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const updatedPayload = {
        message: 'Updated Comment',
        sender: 'Updated User'
      };

      await request(app)
        .put(`/comments/${createdCommentId}`)
        .send(updatedPayload);

      expect(consoleSpy).toHaveBeenCalledWith(
        `Comment with ID ${createdCommentId} updated successfully.`,
        expect.objectContaining({
          message: updatedPayload.message,
          sender: updatedPayload.sender
        })
      );

      consoleSpy.mockRestore();
    });

    test('should handle database error', async () => {
      const mockFindById = jest.spyOn(Comment, 'findById').mockRejectedValueOnce(new Error('Database error'));
  
      const response = await request(app)
        .get(`/comments/${createdCommentId}`);
  
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Database error');
  
      mockFindById.mockRestore();
    });
  });

  describe('DELETE /comments/:id', () => {
    test('should delete comment', async () => {
      const response = await request(app)
        .delete(`/comments/${createdCommentId}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(createdCommentId);

      const getResponse = await request(app)
        .get(`/comments/${createdCommentId}`);
      expect(getResponse.body).toHaveProperty('error', 'Comment not found');
    });

    test('should handle non-existent comment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .delete(`/comments/${nonExistentId}`);

      expect(response.status).toBe(404);
    });

    test('should handle database error', async () => {
      const mockFindById = jest.spyOn(Comment, 'findByIdAndDelete').mockRejectedValueOnce(new Error('Database error'));
  
      const response = await request(app)
        .delete(`/comments/${createdCommentId}`);
  
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Database error');
  
      mockFindById.mockRestore();
    });
  });
});
