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

export const UserController = {
  getMyProfile,
};
