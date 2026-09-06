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
exports.ProjectMemberService = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const prisma_1 = __importDefault(require("../../../../config/prisma"));
const AppError_1 = __importDefault(require("../../../Errors/AppError"));
const prisma_2 = require("../../../../generated/prisma");
const notification_utils_1 = require("../../notification/notification.utils");
const activity_log_utils_1 = require("../../activity-log/activity-log.utils");
const addProjectMember = (projectId, payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check Project Exists
    const project = yield prisma_1.default.project.findUnique({
        where: {
            id: projectId,
        },
    });
    if (!project) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Project not found");
    }
    // 2. Check Login User is Workspace Member
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
    // 3. Only OWNER / ADMIN Can Add Members
    if (workspaceMember.role !== prisma_2.WorkspaceRole.OWNER &&
        workspaceMember.role !== prisma_2.WorkspaceRole.ADMIN) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only workspace owner or admin can add project members");
    }
    // 4. Check Target User is Workspace Member
    const targetMember = yield prisma_1.default.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId: project.workspaceId,
                userId: payload.userId,
            },
        },
    });
    if (!targetMember) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is not a workspace member");
    }
    // 5. Check Already Added
    const existingMember = yield prisma_1.default.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId,
                userId: payload.userId,
            },
        },
    });
    if (existingMember) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is already a project member");
    }
    // 6. Add Project Member
    const projectMember = yield prisma_1.default.projectMember.create({
        data: {
            projectId,
            userId: payload.userId,
            role: payload.role,
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
    // Create Notification
    yield (0, notification_utils_1.createNotification)({
        userId: payload.userId,
        title: "Added to Project",
        message: `You have been added to "${project.name}".`,
        type: prisma_2.NotificationType.PROJECT_CREATED,
        link: `/projects/${project.id}`,
    });
    // Create Activity Log
    yield (0, activity_log_utils_1.createActivityLog)({
        userId: user.userId,
        workspaceId: project.workspaceId,
        action: prisma_2.ActivityAction.ADD_MEMBER,
        entity: prisma_2.ActivityEntity.PROJECT_MEMBER,
        entityId: projectMember.id,
        metadata: {
            projectId: project.id,
            projectName: project.name,
            memberId: projectMember.userId,
            memberName: projectMember.user.name,
            role: projectMember.role,
        },
    });
    return projectMember;
});
const getProjectMembers = (projectId, user) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check Project Exists
    const project = yield prisma_1.default.project.findUnique({
        where: {
            id: projectId,
        },
    });
    if (!project) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Project not found");
    }
    // 2. Check Login User is Workspace Member
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
    // 3. Get Project Members
    const members = yield prisma_1.default.projectMember.findMany({
        where: {
            projectId,
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
            joinedAt: "asc",
        },
    });
    return members;
});
const updateProjectMemberRole = (memberId, payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check Project Member Exists
    const projectMember = yield prisma_1.default.projectMember.findUnique({
        where: {
            id: memberId,
        },
        include: {
            project: true,
        },
    });
    if (!projectMember) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Project member not found");
    }
    // 2. Check Login User Workspace Member
    const workspaceMember = yield prisma_1.default.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId: projectMember.project.workspaceId,
                userId: user.userId,
            },
        },
    });
    if (!workspaceMember) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not a member of this workspace");
    }
    // 3. If not Owner, then check Project Member Permission
    if (workspaceMember.role !== prisma_2.WorkspaceRole.OWNER) {
        const loginProjectMember = yield prisma_1.default.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId: projectMember.projectId,
                    userId: user.userId,
                },
            },
        });
        if (!loginProjectMember) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not a project member");
        }
        if (loginProjectMember.role !== prisma_2.ProjectRole.PROJECT_ADMIN) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized to update project member roles");
        }
        if (projectMember.role === prisma_2.ProjectRole.PROJECT_ADMIN) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Project admin cannot update another project admin");
        }
    }
    // 4. Update Role
    const updatedMember = yield prisma_1.default.projectMember.update({
        where: {
            id: memberId,
        },
        data: {
            role: payload.role,
        },
    });
    // 5. Create Notification
    yield (0, notification_utils_1.createNotification)({
        userId: updatedMember.userId,
        title: "Project Role Updated",
        message: `Your role has been changed to ${updatedMember.role}.`,
        type: prisma_2.NotificationType.PROJECT_ROLE_UPDATED,
        link: `/projects/${updatedMember.projectId}`,
    });
    // 6. Create Activity Log
    yield (0, activity_log_utils_1.createActivityLog)({
        userId: user.userId,
        workspaceId: projectMember.project.workspaceId,
        action: prisma_2.ActivityAction.UPDATE_ROLE,
        entity: prisma_2.ActivityEntity.PROJECT_MEMBER,
        entityId: updatedMember.id,
        metadata: {
            projectId: updatedMember.projectId,
            memberId: updatedMember.userId,
            newRole: updatedMember.role,
        },
    });
    return updatedMember;
});
const removeProjectMember = (memberId, user) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check Project Member Exists
    const projectMember = yield prisma_1.default.projectMember.findUnique({
        where: {
            id: memberId,
        },
        include: {
            project: true,
        },
    });
    if (!projectMember) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Project member not found");
    }
    // Save data before delete
    const removedUserId = projectMember.userId;
    const projectName = projectMember.project.name;
    const projectId = projectMember.projectId;
    // 2. Check Workspace Member
    const workspaceMember = yield prisma_1.default.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId: projectMember.project.workspaceId,
                userId: user.userId,
            },
        },
    });
    if (!workspaceMember) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not a member of this workspace");
    }
    // 3. Workspace Owner -> Can Remove Anyone
    if (workspaceMember.role === prisma_2.WorkspaceRole.OWNER) {
        yield prisma_1.default.projectMember.delete({
            where: {
                id: memberId,
            },
        });
        // Create Notification
        yield (0, notification_utils_1.createNotification)({
            userId: removedUserId,
            title: "Removed from Project",
            message: `You have been removed from "${projectName}".`,
            type: prisma_2.NotificationType.PROJECT_MEMBER_REMOVED,
            link: `/projects/${projectId}`,
        });
        // Create Activity Log
        yield (0, activity_log_utils_1.createActivityLog)({
            userId: user.userId,
            workspaceId: projectMember.project.workspaceId,
            action: prisma_2.ActivityAction.REMOVE_MEMBER,
            entity: prisma_2.ActivityEntity.PROJECT_MEMBER,
            entityId: projectMember.id,
            metadata: {
                projectId,
                projectName,
                memberId: removedUserId,
                role: projectMember.role,
            },
        });
        return null;
    }
    // 4. Login User Project Member
    const loginProjectMember = yield prisma_1.default.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId,
                userId: user.userId,
            },
        },
    });
    if (!loginProjectMember) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not a project member");
    }
    // 5. Only Project Admin
    if (loginProjectMember.role !== prisma_2.ProjectRole.PROJECT_ADMIN) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized to remove project members");
    }
    // 6. Project Admin Can't Remove Another Project Admin
    if (projectMember.role === prisma_2.ProjectRole.PROJECT_ADMIN) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Project admin cannot remove another project admin");
    }
    // 7. Remove Member
    yield prisma_1.default.projectMember.delete({
        where: {
            id: memberId,
        },
    });
    // 8. Create Notification
    yield (0, notification_utils_1.createNotification)({
        userId: removedUserId,
        title: "Removed from Project",
        message: `You have been removed from "${projectName}".`,
        type: prisma_2.NotificationType.PROJECT_MEMBER_REMOVED,
        link: `/projects/${projectId}`,
    });
    // Create Activity Log
    yield (0, activity_log_utils_1.createActivityLog)({
        userId: user.userId,
        workspaceId: projectMember.project.workspaceId,
        action: prisma_2.ActivityAction.REMOVE_MEMBER,
        entity: prisma_2.ActivityEntity.PROJECT_MEMBER,
        entityId: projectMember.id,
        metadata: {
            projectId,
            memberId: removedUserId,
            projectName,
            role: projectMember.role,
        },
    });
    return null;
});
exports.ProjectMemberService = {
    addProjectMember,
    getProjectMembers,
    updateProjectMemberRole,
    removeProjectMember,
};
