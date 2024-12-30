// import { appPromise } from "../../appPromise"; // שנה לפי מיקום קובץ האפליקציה שלך
// import mongoose from "mongoose";
// import { Comment } from "../../models/comment.model";
// import { Application } from "express";
// import request from "supertest";

// var app: Application;

// beforeAll(async () => {
//   app = await appPromise;
//   await Comment.deleteMany(); // מחיקת כל התגובות לפני הבדיקות
// });

// afterAll(async () => {
//   await mongoose.connection.close();
// });

// describe("Comments API", () => {
//   let createdCommentId: string;
//   let createdPostId: string;

//   // יצירת פוסט חדש לפני כל הבדיקות
//   beforeAll(async () => {
//     const postPayload = {
//       message: "Post for comment",
//       sender: "Test Sender",
//     };

//     const postResponse = await request(app).post("/posts").send(postPayload);
//     createdPostId = postResponse.body._id; // שמירת ה-ID של הפוסט שנוצר
//   });

//   test("getComments - should return an empty array initially", async () => {
//     const response = await request(app).get("/comments");
//     expect(response.status).toBe(200);
//     expect(response.body).toEqual([]); // במידה ואין תגובות, צריך להחזיר מערך ריק
//   });

//   test("createComment - should create a comment successfully", async () => {
//     const commentPayload = {
//       postId: createdPostId, // השתמש ב-ID של הפוסט שנוצר
//       message: "This is a test comment",
//       sender: "Test Sender",
//     };

//     const response = await request(app).post("/comments").send(commentPayload);
//     createdCommentId = response.body._id; // שמירת ה-ID של התגובה שנוצרה

//     expect(response.status).toBe(201);
//     expect(response.body.message).toBe("This is a test comment");
//     expect(response.body.sender).toBe("Test Sender");
//   });

//   test("getComments - should return the created comment", async () => {
//     const response = await request(app).get("/comments");
//     expect(response.status).toBe(200);
//     expect(response.body).toHaveLength(1); // דואגים שיהיה תגובה אחת
//     expect(response.body[0].message).toBe("This is a test comment");
//     expect(response.body[0].sender).toBe("Test Sender");
//   });

//   test("getCommentsById - should return the comment by ID", async () => {
//     const response = await request(app).get(`/comments/${createdCommentId}`);
//     expect(response.status).toBe(200);
//     expect(response.body._id).toBe(createdCommentId);
//     expect(response.body.message).toBe("This is a test comment");
//   });

//   test("getCommentsById - should return error if comment not found", async () => {
//     const response = await request(app).get("/comments/invalid-id");
//     expect(response.status).toBe(404);
//     expect(response.body.error).toBe("Comment not found");
//   });

//   test("updateComment - should update the comment successfully", async () => {
//     const updatePayload = {
//       message: "Updated comment message",
//       sender: "Updated Sender",
//     };

//     const response = await request(app)
//       .put(`/comments/${createdCommentId}`)
//       .send(updatePayload);

//     expect(response.status).toBe(200);
//     expect(response.body.message).toBe("Updated comment message");
//     expect(response.body.sender).toBe("Updated Sender");
//   });

//   test("deleteComment - should delete the comment successfully", async () => {
//     const response = await request(app).delete(`/comments/${createdCommentId}`);
//     expect(response.status).toBe(200);
//     expect(response.body._id).toBe(createdCommentId);
//   });

//   test("getComments - should return an empty array after deletion", async () => {
//     const response = await request(app).get("/comments");
//     expect(response.status).toBe(200);
//     expect(response.body).toEqual([]);
//   });
// });
