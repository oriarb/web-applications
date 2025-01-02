import mongoose from 'mongoose';
import request from 'supertest';
import { Comment } from '../../models/comment.model';
import app from '../../app';
import dotenv from 'dotenv';
import { createUser, testLogin } from '../../utils/createUser';
import { User } from '../../models/user.model';

dotenv.config({ path: '.env.test' });

const dbUrl: string = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

describe('Comments API', () => {
  let testPostId: string;
  let createdCommentId: string;
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
  });

  afterAll(async () => {
    try {
        await Comment.deleteMany({});
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
      .post('/posts')
      .send({
        message: 'Test Post',
        sender: 'Test Author'
      })
      .set('Authorization', `JWT ${testUserToken}`);
    testPostId = postResponse.body._id;

    const commentResponse = await request(app)
      .post('/comments')
      .send({
        postId: testPostId,
        message: 'Test Comment',
        sender: 'Test User'
      })
      .set('Authorization', `JWT ${testUserToken}`);
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
        .send(commentPayload)
        .set('Authorization', `JWT ${testUserToken}`);

      expect(response.status).toBe(200);
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
        })
        .set('Authorization', `JWT ${testUserToken}`);

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
        })
        .set('Authorization', `JWT ${testUserToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /comments', () => {
    test('should get all comments', async () => {
      const response = await request(app).get('/comments').set('Authorization', `JWT ${testUserToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
    });

    test('should filter comments by postId', async () => {
      const response = await request(app)
        .get(`/comments?postId=${testPostId}`)
        .set('Authorization', `JWT ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].postId).toBe(testPostId);
    });

    test('should filter comments by sender', async () => {
      const response = await request(app)
        .get('/comments?sender=Test User')
        .set('Authorization', `JWT ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].sender).toBe('Test User');
    });

    test('should handle database error', async () => {
      const mockFind = jest.spyOn(Comment, 'find').mockReturnValueOnce({
        lean: jest.fn().mockRejectedValueOnce(new Error('Database error'))
      } as any);
    
      const response = await request(app).get('/comments').set('Authorization', `JWT ${testUserToken}`);
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Database error');
    
      mockFind.mockRestore();
    });

    test('should return error when no token is provided', async () => {
      const response = await request(app).get('/comments');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Access denied. No token provided.');
    });

    test('should return error when token is invalid', async () => {
      const response = await request(app).get('/comments').set('Authorization', 'Invalid token');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid token');
    });

    test('should return error when postId is invalid', async () => {
      const response = await request(app)
        .get('/comments?postId=invalid-id')
        .set('Authorization', `JWT ${testUserToken}`);
  
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid post ID');
    });
  });

  describe('GET /comments/:id', () => {
    test('should get comment by id', async () => {
      const response = await request(app)
        .get(`/comments/${createdCommentId}`)
        .set('Authorization', `JWT ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeTruthy();
      expect(response.body._id).toBe(createdCommentId);
    });

    test('should handle invalid id format', async () => {
      const response = await request(app)
        .get('/comments/invalid-id')
        .set('Authorization', `JWT ${testUserToken}`);

      expect(response.status).toBe(400);
    });

    test('should handle database error', async () => {
      const mockFindById = jest.spyOn(Comment, 'findById').mockRejectedValueOnce(new Error('Database error'));
  
      const response = await request(app)
        .get(`/comments/${createdCommentId}`)
        .set('Authorization', `JWT ${testUserToken}`);
  
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Database error');
  
      mockFindById.mockRestore();
    });

    test('should handle non-existent comment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .get(`/comments/${nonExistentId}`)
        .set('Authorization', `JWT ${testUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Comment not found');
    });

    test('should handle database error', async () => {
      const mockFindById = jest.spyOn(Comment, 'findById').mockRejectedValueOnce(new Error('Database error'));
  
      const response = await request(app)
        .get(`/comments/${createdCommentId}`)
        .set('Authorization', `JWT ${testUserToken}`);
  
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Database error');
  
      mockFindById.mockRestore();
    });


    test('should handle non-existent comment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .get(`/comments/${nonExistentId}`)
        .set('Authorization', `JWT ${testUserToken}`);

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
        .send(updatedPayload)
        .set('Authorization', `JWT ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeTruthy();
      expect(response.body._id).toBe(createdCommentId);
      expect(response.body.message).toBe(updatedPayload.message);
      expect(response.body.sender).toBe(updatedPayload.sender);
    });

    test('should log success message', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const updatedPayload = {
        message: 'Updated Comment',
        sender: 'Updated User'
      };

      await request(app)
        .put(`/comments/${createdCommentId}`)
        .send(updatedPayload)
        .set('Authorization', `JWT ${testUserToken}`);

      expect(consoleSpy).toHaveBeenCalledWith(
        `Comment with ID ${createdCommentId} updated successfully.`);

      consoleSpy.mockRestore();
    });

    test('should handle non-existent comment`', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .put(`/comments/${nonExistentId}`)
        .set('Authorization', `JWT ${testUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Comment not found');
    });

    test('should handle database error', async () => {
      const mockFindById = jest.spyOn(Comment, 'findByIdAndUpdate').mockRejectedValueOnce(new Error('Database error'));
  
      const response = await request(app)
        .put(`/comments/${createdCommentId}`)
        .set('Authorization', `JWT ${testUserToken}`);
  
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Database error');
  
      mockFindById.mockRestore();
    });

  });

  describe('DELETE /comments/:id', () => {
    test('should delete comment', async () => {
      const response = await request(app)
        .delete(`/comments/${createdCommentId}`)
        .set('Authorization', `JWT ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(createdCommentId);

      const getResponse = await request(app)
        .get(`/comments/${createdCommentId}`)
        .set('Authorization', `JWT ${testUserToken}`);
      expect(getResponse.body).toHaveProperty('error', 'Comment not found');
    });

    test('should handle non-existent comment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .delete(`/comments/${nonExistentId}`)
        .set('Authorization', `JWT ${testUserToken}`);

      expect(response.status).toBe(404);
    });

    test('should handle database error', async () => {
      const mockFindById = jest.spyOn(Comment, 'findByIdAndDelete').mockRejectedValueOnce(new Error('Database error'));
  
      const response = await request(app)
        .delete(`/comments/${createdCommentId}`)
        .set('Authorization', `JWT ${testUserToken}`);
  
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Database error');
  
      mockFindById.mockRestore();
    });
  });
});
