import httpStatus from "http-status-codes";
import { ActivityLogService } from "./activity-log.service";
import { catchAsync } from "../../../utils/catchAsync";
import { Request, Response } from "express";
import { IAuthUser } from "../../interface/common";
import AppError from "../../Errors/AppError";
import { sendResponse } from "../../../utils/sendResponse";

const getActivityLogs = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { workspaceId } = req.params;
    if (!req.user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }
    const result = await ActivityLogService.getActivityLogs(
      workspaceId as string,
      req.user,
      req.query,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Activity logs retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

export const ActivityLogController = {
  getActivityLogs,
};
