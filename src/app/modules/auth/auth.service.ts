import prisma from "../../../config/prisma";
import AppError from "../../Errors/AppError";
import { IRegisterUser } from "./auth.interface";
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

export const AuthService = {
  registerUser,
};
