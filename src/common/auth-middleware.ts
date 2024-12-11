import { NextFunction, Request, Response } from 'express';
import { JwtPayload, Secret, verify } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | string;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access denied. No token provided.' });
      return;
    }

    const secret: Secret = process.env.ACCESS_TOKEN_SECRET as Secret;
    const decoded = verify(token, secret);

    req.user = decoded;

    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
