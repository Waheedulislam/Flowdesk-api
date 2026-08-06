import prisma from "../../../config/prisma";
import AppError from "../../Errors/AppError";
import { IAuthUser } from "../../interface/common";
import httpStatus from "http-status-codes";

const getMyNotifications = async (user: IAuthUser) => {
  const notifications = await prisma.notification.findMany({
    where: {
      userId: user!.userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return notifications;
};

const markAsRead = async (notificationId: string, user: IAuthUser) => {
  const notification = await prisma.notification.findUnique({
    where: {
      id: notificationId,
    },
  });

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, "Notification not found");
  }

  if (notification.userId !== user!.userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to access this notification",
    );
  }

  return prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      isRead: true,
    },
  });
};

const markAllAsRead = async (user: IAuthUser) => {
  await prisma.notification.updateMany({
    where: {
      userId: user!.userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return null;
};

const deleteNotification = async (notificationId: string, user: IAuthUser) => {
  const notification = await prisma.notification.findUnique({
    where: {
      id: notificationId,
    },
  });

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, "Notification not found");
  }

  if (notification.userId !== user!.userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this notification",
    );
  }

  await prisma.notification.delete({
    where: {
      id: notificationId,
    },
  });

  return null;
};

export const NotificationService = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
