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
exports.AnalyticsService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const AppError_1 = __importDefault(require("../../Errors/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const prisma_2 = require("../../../generated/prisma");
// Get workspace Analytics
const getWorkspaceAnalytics = (workspaceId, user) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check Workspace
    const workspace = yield prisma_1.default.workspace.findUnique({
        where: {
            id: workspaceId,
        },
    });
    if (!workspace) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Workspace not found");
    }
    // 2. Check Workspace Member
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
    // 3. Get Analytics
    const [totalProjects, totalTasks, completedTasks, inProgressTasks, todoTasks, totalMembers, overdueTasks,] = yield Promise.all([
        prisma_1.default.project.count({
            where: {
                workspaceId,
            },
        }),
        prisma_1.default.task.count({
            where: {
                project: {
                    workspaceId,
                },
            },
        }),
        prisma_1.default.task.count({
            where: {
                project: {
                    workspaceId,
                },
                status: prisma_2.TaskStatus.DONE,
            },
        }),
        prisma_1.default.task.count({
            where: {
                project: {
                    workspaceId,
                },
                status: prisma_2.TaskStatus.IN_PROGRESS,
            },
        }),
        prisma_1.default.task.count({
            where: {
                project: {
                    workspaceId,
                },
                status: prisma_2.TaskStatus.TODO,
            },
        }),
        prisma_1.default.workspaceMember.count({
            where: {
                workspaceId,
            },
        }),
        prisma_1.default.task.count({
            where: {
                project: {
                    workspaceId,
                },
                dueDate: {
                    lt: new Date(),
                },
                status: {
                    not: prisma_2.TaskStatus.DONE,
                },
            },
        }),
    ]);
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return {
        totalProjects,
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        totalMembers,
        overdueTasks,
        completionRate,
    };
});
// Get project Analytics
const getProjectAnalytics = (workspaceId, user) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check Workspace
    const workspace = yield prisma_1.default.workspace.findUnique({
        where: {
            id: workspaceId,
        },
    });
    if (!workspace) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Workspace not found");
    }
    // 2. Check Workspace Member
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
    // 3. Get Project Analytics
    const projects = yield prisma_1.default.project.findMany({
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
        const completedTasks = project.tasks.filter((task) => task.status === prisma_2.TaskStatus.DONE).length;
        const inProgressTasks = project.tasks.filter((task) => task.status === prisma_2.TaskStatus.IN_PROGRESS).length;
        const todoTasks = project.tasks.filter((task) => task.status === prisma_2.TaskStatus.TODO).length;
        const totalTasks = project._count.tasks;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        return {
            projectId: project.id,
            projectName: project.name,
            totalTasks: project._count.tasks,
            completedTasks,
            inProgressTasks,
            todoTasks,
            completionRate,
        };
    });
});
// Get Member Analytics
const getMemberAnalytics = (workspaceId, user) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check Workspace
    const workspace = yield prisma_1.default.workspace.findUnique({
        where: {
            id: workspaceId,
        },
    });
    if (!workspace) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Workspace not found");
    }
    // 2. Check Workspace Member
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
    // 3. Get Workspace Members
    const members = yield prisma_1.default.workspaceMember.findMany({
        where: {
            workspaceId,
        },
        select: {
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
    // 4. Get Member Task Analytics
    const memberAnalytics = yield Promise.all(members.map((member) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = member.user.id;
        const [totalTasks, completedTasks, inProgressTasks, todoTasks] = yield Promise.all([
            prisma_1.default.task.count({
                where: {
                    assignedTo: userId,
                    project: {
                        workspaceId,
                    },
                },
            }),
            prisma_1.default.task.count({
                where: {
                    assignedTo: userId,
                    project: {
                        workspaceId,
                    },
                    status: prisma_2.TaskStatus.DONE,
                },
            }),
            prisma_1.default.task.count({
                where: {
                    assignedTo: userId,
                    project: {
                        workspaceId,
                    },
                    status: prisma_2.TaskStatus.IN_PROGRESS,
                },
            }),
            prisma_1.default.task.count({
                where: {
                    assignedTo: userId,
                    project: {
                        workspaceId,
                    },
                    status: prisma_2.TaskStatus.TODO,
                },
            }),
        ]);
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        return {
            userId: member.user.id,
            name: member.user.name,
            email: member.user.email,
            avatar: member.user.avatar,
            totalTasks,
            completedTasks,
            inProgressTasks,
            todoTasks,
            completionRate,
        };
    })));
    return memberAnalytics;
});
exports.AnalyticsService = {
    getWorkspaceAnalytics,
    getProjectAnalytics,
    getMemberAnalytics,
};
