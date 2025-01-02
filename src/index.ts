import mongoose from 'mongoose';
import dotenv from 'dotenv';
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerOptions from "./swaggerOptions";
import app from './app';

dotenv.config();

const port: string = process.env.PORT as string;
const dbUrl: string = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

export const startServer = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');

    const swaggerSpec: object = swaggerJsdoc(swaggerOptions);
    app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

startServer();
