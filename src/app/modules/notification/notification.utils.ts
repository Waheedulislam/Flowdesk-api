import prisma from "../../../config/prisma";
import { ICreateNotification } from "./notification.interface";

export const createNotification = async (payload: ICreateNotification) => {
  return prisma.notification.create({
    data: {
      userId: payload.userId,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      link: payload.link,
    },
  });
};
