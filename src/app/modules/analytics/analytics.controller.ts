import httpStatus from "http-status-codes";
import { Request, Response } from "express";

import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { IAuthUser } from "../../interface/common";
import AppError from "../../Errors/AppError";
import { AnalyticsService } from "./analytics.service";

const getWorkspaceAnalytics = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    if (!req.user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    const result = await AnalyticsService.getWorkspaceAnalytics(
      req.params.workspaceId as string,
      req.user,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Workspace analytics retrieved successfully",
      data: result,
    });
  },
);
const getProjectAnalytics = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    if (!req.user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    const result = await AnalyticsService.getProjectAnalytics(
      req.params.workspaceId as string,
      req.user,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Project analytics retrieved successfully",
      data: result,
    });
  },
);

export const AnalyticsController = {
  getWorkspaceAnalytics,
  getProjectAnalytics,
};
