import httpStatus from "http-status-codes";
import prisma from "../../../config/prisma";
import AppError from "../../Errors/AppError";
import { IAuthUser } from "../../interface/common";
import { User, UserStatus } from "../../../generated/prisma";
import { uploadToCloudinary } from "../../../utils/uploadToCloudinary";
import cloudinary from "../../../config/cloudinary";
import { defaultUserSelect } from "./user.constant";

const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_AVATAR_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const getMyProfile = async (user: IAuthUser) => {
  const userInfo = await prisma.user.findUnique({
    where: {
      id: user?.userId,
    },
    select: defaultUserSelect,
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
  const userInfo = await prisma.user.findUnique({
    where: {
      id: user?.userId,
    },
  });

  if (!userInfo) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (userInfo.status !== UserStatus.ACTIVE) {
    throw new AppError(httpStatus.FORBIDDEN, "User account is inactive");
  }

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
    select: defaultUserSelect,
  });

  return updatedUser;
};

const uploadMyAvatar = async (user: IAuthUser, file: Express.Multer.File) => {
  if (!user?.userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, "No avatar file uploaded");
  }

  if (!ALLOWED_AVATAR_MIME_TYPES.has(file.mimetype)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only JPEG, PNG, and WebP image files are allowed.",
    );
  }

  if (file.size > MAX_AVATAR_FILE_SIZE) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Avatar must be 5 MB or smaller.",
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: {
      id: true,
      status: true,
      avatar: true,
      avatarPublicId: true,
    },
  });

  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (existingUser.status !== UserStatus.ACTIVE) {
    throw new AppError(httpStatus.FORBIDDEN, "User account is inactive");
  }

  const uploadResponse = await uploadToCloudinary(
    file.buffer,
    `flowdesk/users/${user.userId}`,
  );

  if (!uploadResponse?.secure_url || !uploadResponse?.public_id) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Avatar upload failed. Please try again.",
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.userId },
    data: {
      avatar: uploadResponse.secure_url,
      avatarPublicId: uploadResponse.public_id,
    },
    select: defaultUserSelect,
  });

  if (
    existingUser.avatarPublicId &&
    existingUser.avatarPublicId !== uploadResponse.public_id
  ) {
    try {
      await cloudinary.uploader.destroy(existingUser.avatarPublicId, {
        resource_type: "image",
      });
    } catch (error) {
      console.error("Avatar cleanup failed after replacement:", error);
    }
  }

  return updatedUser;
};

const deleteMyAvatar = async (user: IAuthUser) => {
  if (!user?.userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: {
      id: true,
      status: true,
      avatar: true,
      avatarPublicId: true,
    },
  });

  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (existingUser.status !== UserStatus.ACTIVE) {
    throw new AppError(httpStatus.FORBIDDEN, "User account is inactive");
  }

  if (existingUser.avatarPublicId) {
    try {
      await cloudinary.uploader.destroy(existingUser.avatarPublicId, {
        resource_type: "image",
      });
    } catch (error) {
      console.error("Avatar delete failed in Cloudinary:", error);
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.userId },
    data: {
      avatar: null,
      avatarPublicId: null,
    },
    select: defaultUserSelect,
  });

  return updatedUser;
};

export const UserService = {
  getMyProfile,
  updateMyProfile,
  uploadMyAvatar,
  deleteMyAvatar,
};
