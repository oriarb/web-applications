import { Request, Response } from 'express';
import { IUser, User } from '../models/user.model';
import { compare, genSalt, hash } from 'bcryptjs';
import { Secret, sign, verify } from 'jsonwebtoken';
import { extractTokenFromRequest } from '../utils/utils';
import { StatusCodes } from 'http-status-codes';

export const register = async (req: Request, res: Response) => {
  const { email, password, username, fullName } = req.body;

  if (!email || !password || !username || !fullName) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: 'Please fill all fields' });
    return;
  }

  try {
    const user = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (user) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'User already exists' });
      return;
    }

    const salt: string = await genSalt(10);
    const encryptedPassword = await hash(password, salt);
    const newUser: IUser = new User({
      email,
      password: encryptedPassword,
      username,
      fullName,
    });
    await newUser.save();

    res.json({ message: 'User registered successfully', newUser });
  } catch (error: any) {
    console.error('Error registering user: ', error.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: 'Please fill all fields' });
    return;
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: 'User does not exist' });
      return;
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: 'Invalid credentials' });
      return;
    }

    const { accessToken, refreshToken } = signTokens(user.id);
    user.tokens = user.tokens.length
      ? [...user.tokens, refreshToken]
      : [refreshToken];
    await user.save();

    res.json({ accessToken, refreshToken });
  } catch (error: any) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = extractTokenFromRequest(req);

  if (!token) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid request' });
    return;
  }

  verify(
    token,
    process.env.REFRESH_TOKEN_SECRET as Secret,
    async (error, userInfo: any) => {
      if (error) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: 'Invalid token' });
      }

      const userId = userInfo.id;

      try {
        const user = await User.findById(userId);
        if (!user) {
          return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ error: 'user not found' });
        }

        if (!user.tokens.includes(token)) {
          user.tokens = [];
          await user.save();
          return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ error: 'token not found' });
        }

        const { accessToken, refreshToken } = signTokens(userId);
        user.tokens[user.tokens.indexOf(token)] = refreshToken;
        await user.save();

        res.send({ accessToken, refreshToken });
      } catch (error: any) {
        console.error('Error refreshing token: ', error.message);
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: error.message });
      }
    },
  );
};

export const logout = (req: Request, res: Response) => {
  const token = extractTokenFromRequest(req);

  if (!token) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid request' });
    return;
  }

  verify(
    token,
    process.env.REFRESH_TOKEN_SECRET as Secret,
    async (error, userInfo: any) => {
      if (error) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: 'Invalid token' });
      }

      const userId = userInfo.id;

      try {
        const user = await User.findById(userId);
        if (!user) {
          return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ error: 'user not found' });
        }

        if (!user.tokens.includes(token)) {
          user.tokens = [];
          await user.save();
          return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ error: 'token not found' });
        }

        user.tokens.splice(user.tokens.indexOf(token), 1);
        await user.save();

        res.send('User logged out successfully');
      } catch (error: any) {
        console.error('Error logging out user: ', error.message);
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: error.message });
      }
    },
  );
};

const signTokens = (
  userId: string,
): { accessToken: string; refreshToken: string } => {
  const accessToken = sign(
    { id: userId },
    process.env.ACCESS_TOKEN_SECRET as Secret,
    { expiresIn: process.env.JWT_TOKEN_EXPIRATION },
  );

  const refreshToken = sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET as Secret,
  );

  return { accessToken, refreshToken };
};
