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

const getProjectAnalytics = async (workspaceId: string, user: IAuthUser) => {
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

  // 3. Get Project Analytics
  const projects = await prisma.project.findMany({
    where: {
      workspaceId,
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          tasks: true,
        },
      },
      tasks: {
        select: {
          status: true,
        },
      },
    },
  });

  // 4. Format Analytics
  return projects.map((project) => {
    const completedTasks = project.tasks.filter(
      (task) => task.status === TaskStatus.DONE,
    ).length;

    const inProgressTasks = project.tasks.filter(
      (task) => task.status === TaskStatus.IN_PROGRESS,
    ).length;

    const todoTasks = project.tasks.filter(
      (task) => task.status === TaskStatus.TODO,
    ).length;

    return {
      projectId: project.id,
      projectName: project.name,
      totalTasks: project._count.tasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
    };
  });
};

export const AnalyticsService = {
  getWorkspaceAnalytics,
  getProjectAnalytics,
};
