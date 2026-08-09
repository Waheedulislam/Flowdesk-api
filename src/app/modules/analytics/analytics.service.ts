import prisma from "../../../config/prisma";
import AppError from "../../Errors/AppError";
import { IAuthUser } from "../../interface/common";
import httpStatus from "http-status-codes";
import { TaskStatus } from "../../../generated/prisma";

const getWorkspaceAnalytics = async (workspaceId: string, user: IAuthUser) => {
  // 1. Check Workspace
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });

  if (!workspace) {
    throw new AppError(httpStatus.NOT_FOUND, "Workspace not found");
  }

  // 2. Check Workspace Member
  const workspaceMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: user!.userId,
      },
    },
  });

  if (!workspaceMember) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this workspace",
    );
  }

  // 3. Get Analytics
  const [
    totalProjects,
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    totalMembers,
    overdueTasks,
  ] = await Promise.all([
    prisma.project.count({
      where: {
        workspaceId,
      },
    }),

    prisma.task.count({
      where: {
        project: {
          workspaceId,
        },
      },
    }),

    prisma.task.count({
      where: {
        project: {
          workspaceId,
        },
        status: TaskStatus.DONE,
      },
    }),

    prisma.task.count({
      where: {
        project: {
          workspaceId,
        },
        status: TaskStatus.IN_PROGRESS,
      },
    }),

    prisma.task.count({
      where: {
        project: {
          workspaceId,
        },
        status: TaskStatus.TODO,
      },
    }),

    prisma.workspaceMember.count({
      where: {
        workspaceId,
      },
    }),
    prisma.task.count({
      where: {
        project: {
          workspaceId,
        },
        dueDate: {
          lt: new Date(),
        },
        status: {
          not: TaskStatus.DONE,
        },
      },
    }),
  ]);

  return {
    totalProjects,
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    totalMembers,
    overdueTasks,
  };
};

export const AnalyticsService = {
  getWorkspaceAnalytics,
};
