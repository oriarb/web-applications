import express, { Application } from 'express';
import postsRoutes from './routes/postsRoutes';
import mongoose from 'mongoose';
import commentsRoutes from './routes/commentsRoutes';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app: Application = express();
const port: string = process.env.PORT as string;
const dbUrl: string = process.env.DB_URL as string;

mongoose
  .connect(dbUrl)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

app.use(bodyParser.json());
app.use('/posts', postsRoutes);
app.use('/comments', commentsRoutes);
app.use('/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
