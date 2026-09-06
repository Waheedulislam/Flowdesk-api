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
exports.NotificationService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const AppError_1 = __importDefault(require("../../Errors/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const getMyNotifications = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const notifications = yield prisma_1.default.notification.findMany({
        where: {
            userId: user.userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return notifications;
});
const markAsRead = (notificationId, user) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield prisma_1.default.notification.findUnique({
        where: {
            id: notificationId,
        },
    });
    if (!notification) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Notification not found");
    }
    if (notification.userId !== user.userId) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized to access this notification");
    }
    return prisma_1.default.notification.update({
        where: {
            id: notificationId,
        },
        data: {
            isRead: true,
        },
    });
});
const markAllAsRead = (user) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.notification.updateMany({
        where: {
            userId: user.userId,
            isRead: false,
        },
        data: {
            isRead: true,
        },
    });
    return null;
});
const deleteNotification = (notificationId, user) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield prisma_1.default.notification.findUnique({
        where: {
            id: notificationId,
        },
    });
    if (!notification) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Notification not found");
    }
    if (notification.userId !== user.userId) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized to delete this notification");
    }
    yield prisma_1.default.notification.delete({
        where: {
            id: notificationId,
        },
    });
    return null;
});
exports.NotificationService = {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};
