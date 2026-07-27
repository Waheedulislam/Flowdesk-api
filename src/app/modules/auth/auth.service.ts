import { Secret, SignOptions } from "jsonwebtoken";
import config from "../../../config";
import prisma from "../../../config/prisma";
import { UserStatus } from "../../../generated/prisma";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import AppError from "../../Errors/AppError";
import { ILoginUser, IRegisterUser } from "./auth.interface";
import bcrypt from "bcrypt";
import httpStatus from "http-status-codes";
import { object } from "zod/v4/mini";
import { email } from "zod";

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
      isVerified: true,
    },
  });
  return user;
};

const loginUser = async (payload: ILoginUser) => {
  const { email, password } = payload;

  const userData = await prisma.user.findUnique({
    where: {
      email,
      status: UserStatus.ACTIVE,
    },
  });

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isPasswordMatched: boolean = await bcrypt.compare(
    password,
    userData.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  // Token information to be sent in response
  const jwtPayload = {
    userId: userData.id,
    email: userData.email,
    role: userData.role,
  };

  const accessToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.access_token_secret as Secret,
    config.jwt.access_token_expires_in as SignOptions["expiresIn"],
  );

  // Generate refresh token
  const refreshToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as SignOptions["expiresIn"],
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_token_secret as Secret,
    );
  } catch (error) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized");
  }

  const userData = await prisma.user.findFirstOrThrow({
    where: {
      id: decodedData.userId,
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  // Token information
  const jwtPayload = {
    userId: decodedData.userId,
    email: userData.email,
    role: userData.role,
  };

  // Access token generation
  const accessToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.access_token_secret as Secret,
    config.jwt.access_token_expires_in as SignOptions["expiresIn"],
  );
  return {
    accessToken,
  };
};

export const AuthService = {
  registerUser,
  loginUser,
  refreshToken,
};
