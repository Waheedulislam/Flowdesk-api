"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const prisma_1 = __importDefault(require("../../../../config/prisma"));
const AppError_1 = __importDefault(require("../../../Errors/AppError"));
const prisma_2 = require("../../../../generated/prisma");
const notification_utils_1 = require("../../notification/notification.utils");
const activity_log_utils_1 = require("../../activity-log/activity-log.utils");
const createComment = (taskId, payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check Task Exists
    const task = yield prisma_1.default.task.findUnique({
        where: {
            id: taskId,
        },
        include: {
            project: true,
        },
    });
    if (!task) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Task not found");
    }
    // 2. Check Workspace Member
    const workspaceMember = yield prisma_1.default.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId: task.project.workspaceId,
                userId: user.userId,
            },
        },
    });
    if (!workspaceMember) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not a member of this workspace");
    }
    // 3. Check Project Member
    const projectMember = yield prisma_1.default.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId: task.projectId,
                userId: user.userId,
            },
        },
    });
    if (!projectMember) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not a member of this project");
    }
    // 4. Create Comment
    const comment = yield prisma_1.default.taskComment.create({
        data: {
            taskId,
            userId: user.userId,
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
    const receivers = new Set();
    // Notify Task Creator
    if (task.createdBy !== user.userId) {
        receivers.add(task.createdBy);
    }
    // Notify Task Assignee
    if (task.assignedTo && task.assignedTo !== user.userId) {
        receivers.add(task.assignedTo);
    }
    // Send Notifications (Parallel)
    yield Promise.all([...receivers].map((receiverId) => (0, notification_utils_1.createNotification)({
        userId: receiverId,
        title: "New Comment",
        message: `${comment.user.name} commented on the task "${task.title}".`,
        type: prisma_2.NotificationType.TASK_COMMENT,
        link: `/projects/${task.projectId}/tasks/${task.id}`,
    })));
    // 6. Create Activity Log
    yield (0, activity_log_utils_1.createActivityLog)({
        userId: user.userId,
        workspaceId: task.project.workspaceId,
        action: prisma_2.ActivityAction.COMMENT,
        entity: prisma_2.ActivityEntity.COMMENT,
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
});
const getComments = (taskId, user) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check Task Exists
    const task = yield prisma_1.default.task.findUnique({
        where: {
            id: taskId,
        },
        include: {
            project: true,
        },
    });
    if (!task) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Task not found");
    }
    // 2. Check Workspace Member
    const workspaceMember = yield prisma_1.default.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId: task.project.workspaceId,
                userId: user.userId,
            },
        },
    });
    if (!workspaceMember) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not a member of this workspace");
    }
    // 3. Check Project Member
    const projectMember = yield prisma_1.default.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId: task.projectId,
                userId: user.userId,
            },
        },
    });
    if (!projectMember) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not a member of this project");
    }
    // 4. Get Comments
    const comments = yield prisma_1.default.taskComment.findMany({
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
});
const updateComment = (commentId, payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check Comment Exists
    const comment = yield prisma_1.default.taskComment.findUnique({
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
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Comment not found");
    }
    // 2. Check Workspace Member
    const workspaceMember = yield prisma_1.default.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId: comment.task.project.workspaceId,
                userId: user.userId,
            },
        },
    });
    if (!workspaceMember) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not a member of this workspace");
    }
    // 3. Permission Check
    const isOwner = workspaceMember.role === prisma_2.WorkspaceRole.OWNER;
    const isCommentOwner = comment.userId === user.userId;
    if (!isOwner && !isCommentOwner) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized to update this comment");
    }
    // 4. Update Comment
    const updatedComment = yield prisma_1.default.taskComment.update({
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
});
const deleteComment = (commentId, user) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check Comment Exists
    const comment = yield prisma_1.default.taskComment.findUnique({
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
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Comment not found");
    }
    // 2. Check Workspace Member
    const workspaceMember = yield prisma_1.default.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId: comment.task.project.workspaceId,
                userId: user.userId,
            },
        },
    });
    if (!workspaceMember) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not a member of this workspace");
    }
    // 3. Permission Check
    const isOwner = workspaceMember.role === prisma_2.WorkspaceRole.OWNER;
    const isCommentOwner = comment.userId === user.userId;
    if (!isOwner && !isCommentOwner) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized to delete this comment");
    }
    // 4. Delete Comment
    yield prisma_1.default.taskComment.delete({
        where: {
            id: commentId,
        },
    });
    return null;
});
exports.CommentService = {
    createComment,
    getComments,
    updateComment,
    deleteComment,
};
