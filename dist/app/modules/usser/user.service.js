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
exports.UserService = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const prisma_1 = __importDefault(require("../../../config/prisma"));
const AppError_1 = __importDefault(require("../../Errors/AppError"));
const prisma_2 = require("../../../generated/prisma");
const uploadToCloudinary_1 = require("../../../utils/uploadToCloudinary");
const cloudinary_1 = __importDefault(require("../../../config/cloudinary"));
const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_AVATAR_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);
const defaultUserSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    status: true,
    avatar: true,
    avatarPublicId: true,
    phone: true,
    bio: true,
    designation: true,
    dateOfBirth: true,
    gender: true,
    jobTitle: true,
    isVerified: true,
    createdAt: true,
    updatedAt: true,
};
const getMyProfile = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const userInfo = yield prisma_1.default.user.findUnique({
        where: {
            id: user === null || user === void 0 ? void 0 : user.userId,
        },
        select: defaultUserSelect,
    });
    if (!userInfo) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (userInfo.status !== prisma_2.UserStatus.ACTIVE) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "User account is inactive");
    }
    return userInfo;
});
const updateMyProfile = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userInfo = yield prisma_1.default.user.findUnique({
        where: {
            id: user === null || user === void 0 ? void 0 : user.userId,
        },
    });
    if (!userInfo) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (userInfo.status !== prisma_2.UserStatus.ACTIVE) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "User account is inactive");
    }
    const allowedFields = [
        "name",
        "avatar",
        "phone",
        "bio",
        "designation",
        "dateOfBirth",
        "gender",
        "jobTitle",
    ];
    const updateData = Object.fromEntries(Object.entries(payload).filter(([key]) => allowedFields.includes(key)));
    if (Object.keys(updateData).length === 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "No valid fields provided for update");
    }
    const updatedUser = yield prisma_1.default.user.update({
        where: {
            id: user === null || user === void 0 ? void 0 : user.userId,
        },
        data: updateData,
        select: defaultUserSelect,
    });
    return updatedUser;
});
const uploadMyAvatar = (user, file) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(user === null || user === void 0 ? void 0 : user.userId)) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Unauthorized");
    }
    if (!file) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "No avatar file uploaded");
    }
    if (!ALLOWED_AVATAR_MIME_TYPES.has(file.mimetype)) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Only JPEG, PNG, and WebP image files are allowed.");
    }
    if (file.size > MAX_AVATAR_FILE_SIZE) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Avatar must be 5 MB or smaller.");
    }
    const existingUser = yield prisma_1.default.user.findUnique({
        where: { id: user.userId },
        select: {
            id: true,
            status: true,
            avatar: true,
            avatarPublicId: true,
        },
    });
    if (!existingUser) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (existingUser.status !== prisma_2.UserStatus.ACTIVE) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "User account is inactive");
    }
    const uploadResponse = yield (0, uploadToCloudinary_1.uploadToCloudinary)(file.buffer, `flowdesk/users/${user.userId}`);
    if (!(uploadResponse === null || uploadResponse === void 0 ? void 0 : uploadResponse.secure_url) || !(uploadResponse === null || uploadResponse === void 0 ? void 0 : uploadResponse.public_id)) {
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "Avatar upload failed. Please try again.");
    }
    const updatedUser = yield prisma_1.default.user.update({
        where: { id: user.userId },
        data: {
            avatar: uploadResponse.secure_url,
            avatarPublicId: uploadResponse.public_id,
        },
        select: defaultUserSelect,
    });
    if (existingUser.avatarPublicId &&
        existingUser.avatarPublicId !== uploadResponse.public_id) {
        try {
            yield cloudinary_1.default.uploader.destroy(existingUser.avatarPublicId, {
                resource_type: "image",
            });
        }
        catch (error) {
            console.error("Avatar cleanup failed after replacement:", error);
        }
    }
    return updatedUser;
});
const deleteMyAvatar = (user) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(user === null || user === void 0 ? void 0 : user.userId)) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const existingUser = yield prisma_1.default.user.findUnique({
        where: { id: user.userId },
        select: {
            id: true,
            status: true,
            avatar: true,
            avatarPublicId: true,
        },
    });
    if (!existingUser) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (existingUser.status !== prisma_2.UserStatus.ACTIVE) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "User account is inactive");
    }
    if (existingUser.avatarPublicId) {
        try {
            yield cloudinary_1.default.uploader.destroy(existingUser.avatarPublicId, {
                resource_type: "image",
            });
        }
        catch (error) {
            console.error("Avatar delete failed in Cloudinary:", error);
        }
    }
    const updatedUser = yield prisma_1.default.user.update({
        where: { id: user.userId },
        data: {
            avatar: null,
            avatarPublicId: null,
        },
        select: defaultUserSelect,
    });
    return updatedUser;
});
exports.UserService = {
    getMyProfile,
    updateMyProfile,
    uploadMyAvatar,
    deleteMyAvatar,
};
