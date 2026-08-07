import httpStatus from "http-status-codes";
import prisma from "../../../../config/prisma";
import AppError from "../../../Errors/AppError";
import { IAuthUser } from "../../../interface/common";
import { ICreateComment, IUpdateComment } from "./comment.interface";
import {
  ActivityAction,
  ActivityEntity,
  NotificationType,
  WorkspaceRole,
} from "../../../../generated/prisma";
import { createNotification } from "../../notification/notification.utils";
import { createActivityLog } from "../../activity-log/activity-log.utils";

const createComment = async (
  taskId: string,
  payload: ICreateComment,
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

  // 3. Check Project Member
  const projectMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: task.projectId,
        userId: user!.userId,
      },
    },
  });

  if (!projectMember) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this project",
    );
  }

  // 4. Create Comment
  const comment = await prisma.taskComment.create({
    data: {
      taskId,
      userId: user!.userId,
      comment: payload.comment,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });
  // 5. Notification Receivers
  const receivers = new Set<string>();
  // Notify Task Creator
  if (task.createdBy !== user!.userId) {
    receivers.add(task.createdBy);
  }

  // Notify Task Assignee
  if (task.assignedTo && task.assignedTo !== user!.userId) {
    receivers.add(task.assignedTo);
  }

  // Send Notifications (Parallel)
  await Promise.all(
    [...receivers].map((receiverId) =>
      createNotification({
        userId: receiverId,
        title: "New Comment",
        message: `${comment.user.name} commented on the task "${task.title}".`,
        type: NotificationType.TASK_COMMENT,
        link: `/projects/${task.projectId}/tasks/${task.id}`,
      }),
    ),
  );

  // 6. Create Activity Log
  await createActivityLog({
    userId: user!.userId,
    workspaceId: task.project.workspaceId,
    action: ActivityAction.COMMENT,
    entity: ActivityEntity.COMMENT,
    entityId: comment.id,
    metadata: {
      taskId: task.id,
      projectId: task.projectId,
      taskTitle: task.title,
      commentId: comment.id,
      commentBy: comment.user.name,
    },
  });
  return comment;
};
const getComments = async (taskId: string, user: IAuthUser) => {
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

  // 3. Check Project Member
  const projectMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: task.projectId,
        userId: user!.userId,
      },
    },
  });

  if (!projectMember) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this project",
    );
  }

  // 4. Get Comments
  const comments = await prisma.taskComment.findMany({
    where: {
      taskId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return comments;
};
const updateComment = async (
  commentId: string,
  payload: IUpdateComment,
  user: IAuthUser,
) => {
  // 1. Check Comment Exists
  const comment = await prisma.taskComment.findUnique({
    where: {
      id: commentId,
    },
    include: {
      task: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, "Comment not found");
  }

  // 2. Check Workspace Member
  const workspaceMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: comment.task.project.workspaceId,
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
  const isOwner = workspaceMember.role === WorkspaceRole.OWNER;
  const isCommentOwner = comment.userId === user!.userId;

  if (!isOwner && !isCommentOwner) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this comment",
    );
  }

  // 4. Update Comment
  const updatedComment = await prisma.taskComment.update({
    where: {
      id: commentId,
    },
    data: {
      comment: payload.comment,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  return updatedComment;
};

const deleteComment = async (commentId: string, user: IAuthUser) => {
  // 1. Check Comment Exists
  const comment = await prisma.taskComment.findUnique({
    where: {
      id: commentId,
    },
    include: {
      task: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, "Comment not found");
  }

  // 2. Check Workspace Member
  const workspaceMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: comment.task.project.workspaceId,
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
  const isOwner = workspaceMember.role === WorkspaceRole.OWNER;
  const isCommentOwner = comment.userId === user!.userId;

  if (!isOwner && !isCommentOwner) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this comment",
    );
  }

  // 4. Delete Comment
  await prisma.taskComment.delete({
    where: {
      id: commentId,
    },
  });

  return null;
};

export const CommentService = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
