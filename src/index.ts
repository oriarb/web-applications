// src/appPromise.ts
import { Application } from "express";
import { appPromise } from "./appPromise";
import dotenv from "dotenv";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerOptions from "./swaggerOptions";

dotenv.config();

const port: number | string = process.env.PORT || 3000;

appPromise.then((app: Application) => {
  const swaggerSpec: object = swaggerJsdoc(swaggerOptions);
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
