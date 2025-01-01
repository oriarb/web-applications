// src/appPromise.ts
import { createApp } from "./createApp";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerOptions from "./swaggerOptions";
import config from './config';

const port: number | string = process.env.PORT || 3000;

async function startServer() {
  try {
    const app = await createApp({
      DB_URL: config.DB_URL
    });
    
    const swaggerSpec: object = swaggerJsdoc(swaggerOptions);
    app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
