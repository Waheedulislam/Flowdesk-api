import prisma from "../../../config/prisma";
import {
  ActivityAction,
  ActivityEntity,
  NotificationType,
  TaskStatus,
  WorkspaceRole,
} from "../../../generated/prisma";
import AppError from "../../Errors/AppError";
import { IAuthUser } from "../../interface/common";
import { createActivityLog } from "../activity-log/activity-log.utils";
import { createNotification } from "../notification/notification.utils";
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
  // 6. Send Notification (if task assigned)
  if (task.assignedTo) {
    await createNotification({
      userId: task.assignedTo,
      title: "New Task Assigned",
      message: `You have been assigned a new task: "${task.title}".`,
      type: NotificationType.TASK_ASSIGNED,
      link: `/projects/${projectId}/tasks/${task.id}`,
    });
  }
  // 7. Create Activity Log
  await createActivityLog({
    userId: user!.userId,
    workspaceId: project.workspaceId,
    action: ActivityAction.CREATE,
    entity: ActivityEntity.TASK,
    entityId: task.id,
    metadata: {
      projectId,
      taskTitle: task.title,
      assignedTo: task.assignedTo,
      priority: task.priority,
      status: task.status,
    },
  });

  return task;
};

const getTasks = async (projectId: string, user: IAuthUser) => {
  // 1. Check Project Exists
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  // 2. Check Workspace Member
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

  // 3. Get Tasks
  const tasks = await prisma.task.findMany({
    where: {
      projectId,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });

  return tasks;
};
const getSingleTask = async (taskId: string, user: IAuthUser) => {
  // 1. Check Task Exists
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      project: {
        select: {
          id: true,
          workspaceId: true,
          name: true,
        },
      },
    },
  });

  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }

  // 2. Check Workspace Member
  const workspaceMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: task.project.workspaceId,
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

  return task;
};

const updateTask = async (
  taskId: string,
  payload: Partial<ICreateTask> & {
    status?: TaskStatus;
  },
  user: IAuthUser,
) => {
  // 1. Check Task Exists
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      project: true,
    },
  });

  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }

  // 2. Check Workspace Member
  const workspaceMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: task.project.workspaceId,
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

  // 3. Permission Check
  if (
    workspaceMember.role !== WorkspaceRole.OWNER &&
    workspaceMember.role !== WorkspaceRole.ADMIN
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only workspace owner or admin can update tasks",
    );
  }

  // 4. If assignee is changed, check member
  if (payload.assignedTo) {
    const assignee = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: task.project.workspaceId,
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

  // sava old data after update
  const oldStatus = task.status;
  const oldAssignee = task.assignedTo;

  // 5. Update Task
  const updatedTask = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      ...payload,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
    },
  });
  // 6. Notify New Assignee
  if (payload.assignedTo && payload.assignedTo !== task.assignedTo) {
    await createNotification({
      userId: payload.assignedTo,
      title: "Task Assigned",
      message: `You have been assigned the task "${updatedTask.title}".`,
      type: NotificationType.TASK_ASSIGNED,
      link: `/projects/${updatedTask.projectId}/tasks/${updatedTask.id}`,
    });
  }

  // 7. Notify Task Creator if Status Changed
  if (payload.status && payload.status !== task.status) {
    await createNotification({
      userId: task.createdBy,
      title: "Task Status Updated",
      message: `Task "${updatedTask.title}" status changed to ${updatedTask.status}.`,
      type: NotificationType.TASK_UPDATED,
      link: `/projects/${updatedTask.projectId}/tasks/${updatedTask.id}`,
    });
  }
  // 8. Create Activity Log
  await createActivityLog({
    userId: user!.userId,
    workspaceId: task.project.workspaceId,
    action: payload.status
      ? ActivityAction.CHANGE_STATUS
      : ActivityAction.UPDATE,
    entity: ActivityEntity.TASK,
    entityId: updatedTask.id,
    metadata: {
      projectId: updatedTask.projectId,
      taskTitle: updatedTask.title,
      oldStatus,
      newStatus: updatedTask.status,
      oldAssignee,
      newAssignee: updatedTask.assignedTo,
    },
  });

  return updatedTask;
};
const deleteTask = async (taskId: string, user: IAuthUser) => {
  // 1. Check Task Exists
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      project: true,
    },
  });

  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }

  // 2. Check Workspace Member
  const workspaceMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: task.project.workspaceId,
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

  // 3. Permission Check
  if (
    workspaceMember.role !== WorkspaceRole.OWNER &&
    workspaceMember.role !== WorkspaceRole.ADMIN
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only workspace owner or admin can delete tasks",
    );
  }
  // Save data before delete
  const assignedUserId = task.assignedTo;
  const taskTitle = task.title;
  const projectId = task.projectId;

  // 4. Delete Task
  await prisma.task.delete({
    where: {
      id: taskId,
    },
  });

  // 5. Notify Assignee
  if (assignedUserId && assignedUserId !== user!.userId) {
    await createNotification({
      userId: assignedUserId,
      title: "Task Deleted",
      message: `The task "${taskTitle}" assigned to you has been deleted.`,
      type: NotificationType.TASK_DELETED,
      link: `/projects/${projectId}`,
    });
  }

  // 6. Create Activity Log
  await createActivityLog({
    userId: user!.userId,
    workspaceId: task.project.workspaceId,
    action: ActivityAction.DELETE,
    entity: ActivityEntity.TASK,
    entityId: taskId,
    metadata: {
      projectId,
      taskTitle,
      assignedTo: assignedUserId,
    },
  });
  return null;
};

export const TaskService = {
  createTask,
  getTasks,
  getSingleTask,
  updateTask,
  deleteTask,
};
