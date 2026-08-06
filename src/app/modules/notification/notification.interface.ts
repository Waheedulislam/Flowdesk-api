import { NotificationType } from "../../../generated/prisma";

export interface ICreateNotification {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}
