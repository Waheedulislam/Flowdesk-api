import httpStatus from "http-status-codes";
import prisma from "../../../config/prisma";
import AppError from "../../Errors/AppError";
import { IAuthUser } from "../../interface/common";
import { User, UserStatus } from "../../../generated/prisma";

const getMyProfile = async (user: IAuthUser) => {
  const userInfo = await prisma.user.findUnique({
    where: {
      id: user?.userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      avatar: true,
    },
  });

  if (!userInfo) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (userInfo.status !== UserStatus.ACTIVE) {
    throw new AppError(httpStatus.FORBIDDEN, "User account is inactive");
  }

  return userInfo;
};
const updateMyProfile = async (user: IAuthUser, payload: Partial<User>) => {
  // Check if user exists
  const userInfo = await prisma.user.findUnique({
    where: {
      id: user?.userId,
    },
  });

  if (!userInfo) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Check account status
  if (userInfo.status !== UserStatus.ACTIVE) {
    throw new AppError(httpStatus.FORBIDDEN, "User account is inactive");
  }

  // Allowed fields
  const allowedFields = [
    "name",
    "avatar",
    "phone",
    "bio",
    "designation",
    "dateOfBirth",
    "gender",
    "jobTitle",
  ];

  const updateData = Object.fromEntries(
    Object.entries(payload).filter(([key]) => allowedFields.includes(key)),
  );

  if (Object.keys(updateData).length === 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "No valid fields provided for update",
    );
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: user?.userId,
    },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      phone: true,
      bio: true,
      designation: true,
      dateOfBirth: true,
      gender: true,
      role: true,
      status: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

export const UserService = {
  getMyProfile,
  updateMyProfile,
};
