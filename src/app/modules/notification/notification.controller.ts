import httpStatus from "http-status-codes";
import { Request, Response } from "express";

import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { IAuthUser } from "../../interface/common";
import { NotificationService } from "./notification.service";

// Get My Notifications
const getMyNotifications = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await NotificationService.getMyNotifications(req.user!);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Notifications retrieved successfully",
      data: result,
    });
  },
);

// Mark As Read
const markAsRead = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await NotificationService.markAsRead(
      req.params.notificationId as string,
      req.user!,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Notification marked as read",
      data: result,
    });
  },
);

// Mark All As Read
const markAllAsRead = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    await NotificationService.markAllAsRead(req.user!);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All notifications marked as read",
      data: null,
    });
  },
);

// Delete Notification
const deleteNotification = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    await NotificationService.deleteNotification(
      req.params.notificationId as string,
      req.user!,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Notification deleted successfully",
      data: null,
    });
  },
);

export const NotificationController = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
