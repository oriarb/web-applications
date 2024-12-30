import { Request, Response } from "express";

export const sendSuccessResponse = (
  res: Response,
  data: any,
  statusCode: number = 200,
  message?: string
) => {
  console.log(message || "Success:", data);
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
