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
exports.ProjectService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const prisma_2 = require("../../../generated/prisma");
const AppError_1 = __importDefault(require("../../Errors/AppError"));
const activity_log_utils_1 = require("../activity-log/activity-log.utils");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createProject = (workspaceId, payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    const workspace = yield prisma_1.default.workspace.findUnique({
        where: {
            id: workspaceId,
        },
    });
    if (!workspace) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Workspace not found");
    }
    const workspaceMember = yield prisma_1.default.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId: user.userId,
            },
        },
    });
    if (!workspaceMember) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not a member of this workspace");
    }
    const project = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Create Project
        const newProject = yield tx.project.create({
            data: {
                workspaceId,
                name: payload.name,
                description: payload.description,
                createdBy: user.userId,
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
            },
        });
        // Automatically add creator as Project Admin
        yield tx.projectMember.create({
            data: {
                projectId: newProject.id,
                userId: user.userId,
                role: prisma_2.ProjectRole.PROJECT_ADMIN,
            },
        });
        // Create Activity Log
        yield tx.activityLog.create({
            data: {
                userId: user.userId,
                workspaceId: newProject.workspaceId,
                action: prisma_2.ActivityAction.CREATE,
                entity: prisma_2.ActivityEntity.PROJECT,
                entityId: newProject.id,
                metadata: {
                    projectName: newProject.name,
                },
            },
        });
        return newProject;
    }));
    return project;
});
const getProjects = (workspaceId, user) => __awaiter(void 0, void 0, void 0, function* () {
    const workspace = yield prisma_1.default.workspace.findUnique({
        where: {
            id: workspaceId,
        },
    });
    if (!workspace) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Workspace not found");
    }
    const workspaceMember = yield prisma_1.default.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId: user.userId,
            },
        },
    });
    console.log("workspaceMember:", workspaceMember);
    if (!workspaceMember) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not a member of this workspace");
    }
    const projects = yield prisma_1.default.project.findMany({
        where: {
            workspaceId,
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
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return projects;
});
const getSingleProject = (projectId, user) => __awaiter(void 0, void 0, void 0, function* () {
    const project = yield prisma_1.default.project.findUnique({
        where: {
            id: projectId,
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
        },
    });
    if (!project) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Project not found");
    }
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
    return project;
});
const updateProject = (projectId, payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    const project = yield prisma_1.default.project.findUnique({
        where: {
            id: projectId,
        },
    });
    if (!project) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Project not found");
    }
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
    if (workspaceMember.role !== prisma_2.WorkspaceRole.OWNER &&
        workspaceMember.role !== prisma_2.WorkspaceRole.ADMIN) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only workspace owner or admin can update projects");
    }
    const updatedProject = yield prisma_1.default.project.update({
        where: {
            id: projectId,
        },
        data: payload,
        include: {
            creator: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
        },
    });
    // Create Activity Log
    yield (0, activity_log_utils_1.createActivityLog)({
        userId: user.userId,
        workspaceId: project.workspaceId,
        action: prisma_2.ActivityAction.UPDATE,
        entity: prisma_2.ActivityEntity.PROJECT,
        entityId: updatedProject.id,
        metadata: {
            projectName: updatedProject.name,
            workspaceId: updatedProject.workspaceId,
        },
    });
    return updatedProject;
});
const deleteProject = (projectId, user) => __awaiter(void 0, void 0, void 0, function* () {
    const project = yield prisma_1.default.project.findUnique({
        where: {
            id: projectId,
        },
    });
    if (!project) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Project not found");
    }
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
    if (workspaceMember.role !== prisma_2.WorkspaceRole.OWNER &&
        workspaceMember.role !== prisma_2.WorkspaceRole.ADMIN) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only workspace owner or admin can delete projects");
    }
    // Save project info before delete
    const projectName = project.name;
    yield prisma_1.default.project.delete({
        where: {
            id: projectId,
        },
    });
    // Active log helpers - Create Activity Log
    yield (0, activity_log_utils_1.createActivityLog)({
        userId: user.userId,
        workspaceId: project.workspaceId,
        action: prisma_2.ActivityAction.DELETE,
        entity: prisma_2.ActivityEntity.PROJECT,
        entityId: projectId,
        metadata: {
            projectName,
            workspaceId: project.workspaceId,
        },
    });
    return null;
});
exports.ProjectService = {
    createProject,
    getProjects,
    getSingleProject,
    updateProject,
    deleteProject,
};
