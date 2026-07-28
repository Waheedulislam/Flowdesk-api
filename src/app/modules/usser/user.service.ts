import httpStatus from "http-status-codes";
import prisma from "../../../config/prisma";
import AppError from "../../Errors/AppError";
import { IAuthUser } from "../../interface/common";
import { UserStatus } from "../../../generated/prisma";

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

export const UserService = {
  getMyProfile,
};
