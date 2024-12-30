import express, { Request, Response, Application } from "express";
import postsRoutes from "./routes/postsRoutes";
import mongoose from "mongoose";
import commentsRoutes from "./routes/commentsRoutes";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const dbUrl: string = process.env.DB_URL || "mongodb://127.0.0.1:27017/test";

export const appPromise = new Promise<Application>((resolve, reject) => {
  mongoose
    .connect(dbUrl)
    .then(() => {
      console.log("Connected to MongoDB");
      const app: Application = express();
      app.use(bodyParser.json());
      app.use("/posts", postsRoutes);
      app.use("/comments", commentsRoutes);
      resolve(app);
    })
    .catch((error) => console.error("Error connecting to MongoDB:", error));
});
