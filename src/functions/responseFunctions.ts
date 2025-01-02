import { Request, Response } from "express";

export const sendSuccessResponse = (
  res: Response,
  data: any,
  message: string,
  statusCode: number = 200,
) => {
  console.log(message);
  res.status(statusCode).json(data);
};

export const sendErrorResponse = (
  res: Response,
  errorMessage: string,
  statusCode: number = 500
) => {
  console.error("Error:", errorMessage);
  res.status(statusCode).json({ error: errorMessage });
};
