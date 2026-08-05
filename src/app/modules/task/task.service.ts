import prisma from "../../../config/prisma";
import AppError from "../../Errors/AppError";
import { IAuthUser } from "../../interface/common";
import { ICreateTask } from "./task.interface";
import httpStatus from "http-status-codes";

const createTask = async (
  projectId: string,
  payload: ICreateTask,
  user: IAuthUser,
) => {
  // 1. Check Project Exists
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }
  // 2. Check Current User is Workspace Member
  const workspaceMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: project.workspaceId,
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
  // 3. Check Assignee (if provided)
  if (payload.assignedTo) {
    const assignee = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: project.workspaceId,
          userId: payload.assignedTo,
        },
      },
    });

    if (!assignee) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Assigned user is not a member of this workspace",
      );
    }
  }
  // 4. Calculate Task Order
  const lastTask = await prisma.task.findFirst({
    where: {
      projectId,
    },
    orderBy: {
      order: "desc",
    },
  });

  const nextOrder = lastTask ? lastTask.order + 1 : 0;

  // 5. Create Task
  const task = await prisma.task.create({
    data: {
      title: payload.title,
      description: payload.description,
      projectId,
      assignedTo: payload.assignedTo,
      createdBy: user!.userId,
      priority: payload.priority,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
      order: nextOrder,
    },
  });

  return task;
};
export const TaskService = {
  createTask,
};
