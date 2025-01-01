import express, { Request, Response, Application } from "express";
import postsRoutes from "./routes/postsRoutes";
import mongoose from "mongoose";
import commentsRoutes from "./routes/commentsRoutes";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

interface AppConfig {
  DB_URL: string;
}

export async function createApp(config?: Partial<AppConfig>) {
  const app: Application = express();
  
  app.use(bodyParser.json());
  
  const dbUrl = config?.DB_URL || process.env.DB_URL;
  
  if (!dbUrl) {
    throw new Error("Database URL is required. Set DB_URL in environment variables or pass it in config.");
  }
  
  await mongoose.connect(dbUrl);
  
  app.use("/posts", postsRoutes);
  app.use("/comments", commentsRoutes);
  
  return app;
}
