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
exports.ActivityLogService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const AppError_1 = __importDefault(require("../../Errors/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const getActivityLogs = (workspaceId, user, query) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check Workspace Exists
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
    // 3. Pagination
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    // 4. Total Count
    const total = yield prisma_1.default.activityLog.count({
        where: {
            workspaceId,
        },
    });
    // 5. Get Activity Logs
    const logs = yield prisma_1.default.activityLog.findMany({
        where: {
            workspaceId,
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
            createdAt: "desc",
        },
        skip,
        take: limit,
    });
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: logs,
    };
});
exports.ActivityLogService = {
    getActivityLogs,
};
