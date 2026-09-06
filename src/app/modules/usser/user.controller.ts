import httpStatus from "http-status-codes";
import { Request, Response } from "express";

import { UserService } from "./user.service";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { IAuthUser } from "../../interface/common";

const getMyProfile = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const user = req.user;
    const result = await UserService.getMyProfile(user as IAuthUser);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Profile retrieved successfully",
      data: result,
    });
  },
);

const updateMyProfile = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;

    const result = await UserService.updateMyProfile(
      user as IAuthUser,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Profile updated successfully",
      data: result,
    });
  },
);

const uploadAvatar = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    if (!req.user) {
      throw new Error("Unauthorized");
    }

    if (!req.file) {
      throw new Error("No avatar file uploaded");
    }

    const result = await UserService.uploadMyAvatar(req.user, req.file);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Avatar uploaded successfully",
      data: result,
    });
  },
);

const deleteAvatar = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    if (!req.user) {
      throw new Error("Unauthorized");
    }

    const result = await UserService.deleteMyAvatar(req.user);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Avatar removed successfully",
      data: result,
    });
  },
);

export const UserController = {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  deleteAvatar,
};
