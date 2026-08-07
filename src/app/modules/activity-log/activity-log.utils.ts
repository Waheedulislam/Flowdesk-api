import prisma from "../../../config/prisma";
import { ActivityAction, ActivityEntity } from "../../../generated/prisma";

interface ICreateActivityLog {
  userId: string;
  action: ActivityAction;
  entity: ActivityEntity;
  entityId: string;
  metadata?: Record<string, any>;
}

export const createActivityLog = async (payload: ICreateActivityLog) => {
  return prisma.activityLog.create({
    data: payload,
  });
};
