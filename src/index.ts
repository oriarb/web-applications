import express, { Request, Response, Application } from "express";
import postsRoutes from "./routes/postsRoutes";
import mongoose from "mongoose";
import commentsRoutes from "./routes/commentsRoutes";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();
const port: number | string = process.env.PORT || 3000;
const dbUrl: string = process.env.DB_URL || "mongodb://localhost:27017/assignment1";

mongoose
  .connect(dbUrl)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

app.use(bodyParser.json());
app.use("/posts", postsRoutes);
app.use("/comments", commentsRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
