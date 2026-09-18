import { Secret, SignOptions } from "jsonwebtoken";
import config from "../../../config";
import prisma from "../../../config/prisma";
import { UserStatus } from "../../../generated/prisma";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import AppError from "../../Errors/AppError";
import { ILoginUser, IRegisterUser } from "./auth.interface";
import bcrypt from "bcrypt";
import httpStatus from "http-status-codes";

function getRefreshTokenExpiry(token: string) {
  const decoded = jwtHelpers.verifyToken(
    token,
    config.jwt.refresh_token_secret as Secret,
  );
  if (!decoded.exp) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
  }
  return new Date(decoded.exp * 1000);
}

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

  await prisma.refreshToken.create({
    data: {
      userId: userData.id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiry(refreshToken),
    },
  });

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token?: string) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized");
  }

  let decodedData;
  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_token_secret as Secret,
    );
  } catch (error) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized");
  }

  const userData = await prisma.user.findFirst({
    where: {
      id: decodedData.userId,
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });
  if (!userData) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Refresh session is invalid");
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
  });
  if (!storedToken || storedToken.expiresAt <= new Date()) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Refresh session is invalid");
  }

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

  const nextRefreshToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as SignOptions["expiresIn"],
  );

  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { token } }),
    prisma.refreshToken.create({
      data: {
        userId: userData.id,
        token: nextRefreshToken,
        expiresAt: getRefreshTokenExpiry(nextRefreshToken),
      },
    }),
  ]);

  return {
    accessToken,
    refreshToken: nextRefreshToken,
  };
};

const logout = async (token?: string) => {
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }
};

export const AuthService = {
  registerUser,
  loginUser,
  refreshToken,
  logout,
};
