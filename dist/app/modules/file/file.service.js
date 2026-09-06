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
exports.FileService = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const prisma_1 = __importDefault(require("../../../config/prisma"));
const AppError_1 = __importDefault(require("../../Errors/AppError"));
const uploadToCloudinary_1 = require("../../../utils/uploadToCloudinary");
const cloudinary_1 = __importDefault(require("../../../config/cloudinary"));
const prisma_2 = require("../../../generated/prisma");
const activity_log_utils_1 = require("../activity-log/activity-log.utils");
const uploadFile = (taskId, file, user) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check Task
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
    // 4. Upload to Cloudinary
    const uploadedFile = yield (0, uploadToCloudinary_1.uploadToCloudinary)(file.buffer, `flowdesk/tasks/${taskId}`);
    // 5. Save File in Database
    const newFile = yield prisma_1.default.file.create({
        data: {
            taskId,
            fileName: file.originalname,
            url: uploadedFile.secure_url,
            publicId: uploadedFile.public_id,
            uploadedBy: user.userId,
        },
    });
    yield (0, activity_log_utils_1.createActivityLog)({
        userId: user.userId,
        workspaceId: task.project.workspaceId,
        action: prisma_2.ActivityAction.FILE_UPLOAD,
        entity: prisma_2.ActivityEntity.FILE,
        entityId: newFile.id,
        metadata: {
            fileName: newFile.fileName,
            taskId: task.id,
            taskTitle: task.title,
            publicId: newFile.publicId,
        },
    });
    return newFile;
});
const getTaskFiles = (taskId, user) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check Task
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
    // 4. Get Task Files
    const files = yield prisma_1.default.file.findMany({
        where: {
            taskId,
        },
        include: {
            uploader: {
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
    return files;
});
const deleteFile = (fileId, user) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check File
    const file = yield prisma_1.default.file.findUnique({
        where: {
            id: fileId,
        },
        include: {
            task: {
                include: {
                    project: true,
                },
            },
        },
    });
    if (!file) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "File not found");
    }
    // 2. Check Workspace Member
    const workspaceMember = yield prisma_1.default.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId: file.task.project.workspaceId,
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
                projectId: file.task.projectId,
                userId: user.userId,
            },
        },
    });
    if (!projectMember) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not a member of this project");
    }
    // 4. Delete from Cloudinary
    try {
        yield cloudinary_1.default.uploader.destroy(file.publicId, {
            resource_type: "image",
        });
    }
    catch (error) {
        console.error("Cloudinary delete failed:", error);
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "Failed to delete file from Cloudinary");
    }
    // 5. Delete from Database
    yield prisma_1.default.file.delete({
        where: {
            id: fileId,
        },
    });
    yield (0, activity_log_utils_1.createActivityLog)({
        userId: user.userId,
        workspaceId: file.task.project.workspaceId,
        action: prisma_2.ActivityAction.FILE_DELETE,
        entity: prisma_2.ActivityEntity.FILE,
        entityId: file.id,
        metadata: {
            fileName: file.fileName,
            taskId: file.task.id,
            taskTitle: file.task.title,
            publicId: file.publicId,
        },
    });
    return null;
});
exports.FileService = {
    uploadFile,
    getTaskFiles,
    deleteFile,
};
