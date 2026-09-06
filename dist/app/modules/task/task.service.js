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
exports.TaskService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const prisma_2 = require("../../../generated/prisma");
const AppError_1 = __importDefault(require("../../Errors/AppError"));
const activity_log_utils_1 = require("../activity-log/activity-log.utils");
const notification_utils_1 = require("../notification/notification.utils");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createTask = (projectId, payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check Project Exists
    const project = yield prisma_1.default.project.findUnique({
        where: {
            id: projectId,
        },
    });
    if (!project) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Project not found");
    }
    // 2. Check Current User is Workspace Member
    const workspaceMember = yield prisma_1.default.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId: project.workspaceId,
                userId: user.userId,
            },
        },
    });
    if (!workspaceMember) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not a member of this workspace");
    }
    // 3. Check Assignee (if provided)
    if (payload.assignedTo) {
        const assignee = yield prisma_1.default.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId: project.workspaceId,
                    userId: payload.assignedTo,
                },
            },
        });
        if (!assignee) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Assigned user is not a member of this workspace");
        }
    }
    // 4. Calculate Task Order
    const lastTask = yield prisma_1.default.task.findFirst({
        where: {
            projectId,
        },
        orderBy: {
            order: "desc",
        },
    });
    const nextOrder = lastTask ? lastTask.order + 1 : 0;
    // 5. Create Task
    const task = yield prisma_1.default.task.create({
        data: {
            title: payload.title,
            description: payload.description,
            projectId,
            assignedTo: payload.assignedTo,
            createdBy: user.userId,
            priority: payload.priority,
            dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
            order: nextOrder,
        },
    });
    // 6. Send Notification (if task assigned)
    if (task.assignedTo) {
        yield (0, notification_utils_1.createNotification)({
            userId: task.assignedTo,
            title: "New Task Assigned",
            message: `You have been assigned a new task: "${task.title}".`,
            type: prisma_2.NotificationType.TASK_ASSIGNED,
            link: `/projects/${projectId}/tasks/${task.id}`,
        });
    }
    // 7. Create Activity Log
    yield (0, activity_log_utils_1.createActivityLog)({
        userId: user.userId,
        workspaceId: project.workspaceId,
        action: prisma_2.ActivityAction.CREATE,
        entity: prisma_2.ActivityEntity.TASK,
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
});
const getTasks = (projectId, user) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check Project Exists
    const project = yield prisma_1.default.project.findUnique({
        where: {
            id: projectId,
        },
    });
    if (!project) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Project not found");
    }
    // 2. Check Workspace Member
    const workspaceMember = yield prisma_1.default.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId: project.workspaceId,
                userId: user.userId,
            },
        },
    });
    if (!workspaceMember) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not a member of this workspace");
    }
    // 3. Get Tasks
    const tasks = yield prisma_1.default.task.findMany({
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
});
const getSingleTask = (taskId, user) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check Task Exists
    const task = yield prisma_1.default.task.findUnique({
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
    return task;
});
const updateTask = (taskId, payload, user) => __awaiter(void 0, void 0, void 0, function* () {
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
    // 3. Permission Check
    if (workspaceMember.role !== prisma_2.WorkspaceRole.OWNER &&
        workspaceMember.role !== prisma_2.WorkspaceRole.ADMIN) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only workspace owner or admin can update tasks");
    }
    // 4. If assignee is changed, check member
    if (payload.assignedTo) {
        const assignee = yield prisma_1.default.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId: task.project.workspaceId,
                    userId: payload.assignedTo,
                },
            },
        });
        if (!assignee) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Assigned user is not a member of this workspace");
        }
    }
    // sava old data after update
    const oldStatus = task.status;
    const oldAssignee = task.assignedTo;
    // 5. Update Task
    const updatedTask = yield prisma_1.default.task.update({
        where: {
            id: taskId,
        },
        data: Object.assign(Object.assign({}, payload), { dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined }),
    });
    // 6. Notify New Assignee
    if (payload.assignedTo && payload.assignedTo !== task.assignedTo) {
        yield (0, notification_utils_1.createNotification)({
            userId: payload.assignedTo,
            title: "Task Assigned",
            message: `You have been assigned the task "${updatedTask.title}".`,
            type: prisma_2.NotificationType.TASK_ASSIGNED,
            link: `/projects/${updatedTask.projectId}/tasks/${updatedTask.id}`,
        });
    }
    // 7. Notify Task Creator if Status Changed
    if (payload.status && payload.status !== task.status) {
        yield (0, notification_utils_1.createNotification)({
            userId: task.createdBy,
            title: "Task Status Updated",
            message: `Task "${updatedTask.title}" status changed to ${updatedTask.status}.`,
            type: prisma_2.NotificationType.TASK_UPDATED,
            link: `/projects/${updatedTask.projectId}/tasks/${updatedTask.id}`,
        });
    }
    // 8. Create Activity Log
    yield (0, activity_log_utils_1.createActivityLog)({
        userId: user.userId,
        workspaceId: task.project.workspaceId,
        action: payload.status
            ? prisma_2.ActivityAction.CHANGE_STATUS
            : prisma_2.ActivityAction.UPDATE,
        entity: prisma_2.ActivityEntity.TASK,
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
});
const deleteTask = (taskId, user) => __awaiter(void 0, void 0, void 0, function* () {
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
    // 3. Permission Check
    if (workspaceMember.role !== prisma_2.WorkspaceRole.OWNER &&
        workspaceMember.role !== prisma_2.WorkspaceRole.ADMIN) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only workspace owner or admin can delete tasks");
    }
    // Save data before delete
    const assignedUserId = task.assignedTo;
    const taskTitle = task.title;
    const projectId = task.projectId;
    // 4. Delete Task
    yield prisma_1.default.task.delete({
        where: {
            id: taskId,
        },
    });
    // 5. Notify Assignee
    if (assignedUserId && assignedUserId !== user.userId) {
        yield (0, notification_utils_1.createNotification)({
            userId: assignedUserId,
            title: "Task Deleted",
            message: `The task "${taskTitle}" assigned to you has been deleted.`,
            type: prisma_2.NotificationType.TASK_DELETED,
            link: `/projects/${projectId}`,
        });
    }
    // 6. Create Activity Log
    yield (0, activity_log_utils_1.createActivityLog)({
        userId: user.userId,
        workspaceId: task.project.workspaceId,
        action: prisma_2.ActivityAction.DELETE,
        entity: prisma_2.ActivityEntity.TASK,
        entityId: taskId,
        metadata: {
            projectId,
            taskTitle,
            assignedTo: assignedUserId,
        },
    });
    return null;
});
exports.TaskService = {
    createTask,
    getTasks,
    getSingleTask,
    updateTask,
    deleteTask,
};
