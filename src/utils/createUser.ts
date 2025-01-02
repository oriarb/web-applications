import { hash } from "bcryptjs";
import { User } from "../models/user.model";
import supertest from "supertest";
import app from "../app";

export const createUser = async (
    email: string,
    password: string,
    username: string,
    fullName: string,
  ) => {
    const hashedPassword = await hash(password, 10);
    return User.create({
      email,
      password: hashedPassword,
      username,
      fullName,
    });
  };

export const testLogin = async (email: string, password: string) => {
    return supertest(app).post('/auth/login').send({ email, password });
  };