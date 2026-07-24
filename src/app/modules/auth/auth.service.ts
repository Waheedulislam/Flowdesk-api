import prisma from "../../../config/prisma";
import AppError from "../../Errors/AppError";
import { ILoginUser, IRegisterUser } from "./auth.interface";
import bcrypt from "bcrypt";
import httpStatus from "http-status-codes";

const registerUser = async (payload: IRegisterUser) => {
  const { name, email, password } = payload;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, "User already exists");
  }

  // Hash password
  const hashPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      password: true,
      isVerified: true,
    },
  });
  return user;
};

const loginUser = async (payload: ILoginUser) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }
  return user;
};

export const AuthService = {
  registerUser,
  loginUser,
};
