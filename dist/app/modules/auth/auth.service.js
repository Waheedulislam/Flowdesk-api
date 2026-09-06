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
exports.AuthService = void 0;
const config_1 = __importDefault(require("../../../config"));
const prisma_1 = __importDefault(require("../../../config/prisma"));
const prisma_2 = require("../../../generated/prisma");
const jwtHelpers_1 = require("../../../helpers/jwtHelpers");
const AppError_1 = __importDefault(require("../../Errors/AppError"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
function getRefreshTokenExpiry(token) {
    const decoded = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.refresh_token_secret);
    if (!decoded.exp) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Invalid refresh token");
    }
    return new Date(decoded.exp * 1000);
}
const registerUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = payload;
    // Check if user already exists
    const existingUser = yield prisma_1.default.user.findUnique({
        where: {
            email,
        },
    });
    if (existingUser) {
        throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "User already exists");
    }
    // Hash password
    const hashPassword = yield bcrypt_1.default.hash(password, 10);
    // Create user
    const user = yield prisma_1.default.user.create({
        data: {
            name,
            email,
            password: hashPassword,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isVerified: true,
        },
    });
    return user;
});
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload;
    const userData = yield prisma_1.default.user.findUnique({
        where: {
            email,
            status: prisma_2.UserStatus.ACTIVE,
        },
    });
    if (!userData) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    const isPasswordMatched = yield bcrypt_1.default.compare(password, userData.password);
    if (!isPasswordMatched) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Invalid email or password");
    }
    // Token information to be sent in response
    const jwtPayload = {
        userId: userData.id,
        email: userData.email,
        role: userData.role,
    };
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken(jwtPayload, config_1.default.jwt.access_token_secret, config_1.default.jwt.access_token_expires_in);
    // Generate refresh token
    const refreshToken = jwtHelpers_1.jwtHelpers.generateToken(jwtPayload, config_1.default.jwt.refresh_token_secret, config_1.default.jwt.refresh_token_expires_in);
    yield prisma_1.default.refreshToken.create({
        data: {
            userId: userData.id,
            token: refreshToken,
            expiresAt: getRefreshTokenExpiry(refreshToken),
        },
    });
    return {
        accessToken,
        refreshToken,
    };
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "You are not authorized");
    }
    let decodedData;
    try {
        decodedData = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.refresh_token_secret);
    }
    catch (error) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "You are not authorized");
    }
    const userData = yield prisma_1.default.user.findFirst({
        where: {
            id: decodedData.userId,
            email: decodedData.email,
            status: prisma_2.UserStatus.ACTIVE,
        },
    });
    if (!userData) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Refresh session is invalid");
    }
    const storedToken = yield prisma_1.default.refreshToken.findUnique({
        where: { token },
    });
    if (!storedToken || storedToken.expiresAt <= new Date()) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Refresh session is invalid");
    }
    // Token information
    const jwtPayload = {
        userId: decodedData.userId,
        email: userData.email,
        role: userData.role,
    };
    // Access token generation
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken(jwtPayload, config_1.default.jwt.access_token_secret, config_1.default.jwt.access_token_expires_in);
    const nextRefreshToken = jwtHelpers_1.jwtHelpers.generateToken(jwtPayload, config_1.default.jwt.refresh_token_secret, config_1.default.jwt.refresh_token_expires_in);
    yield prisma_1.default.$transaction([
        prisma_1.default.refreshToken.delete({ where: { token } }),
        prisma_1.default.refreshToken.create({
            data: {
                userId: userData.id,
                token: nextRefreshToken,
                expiresAt: getRefreshTokenExpiry(nextRefreshToken),
            },
        }),
    ]);
    return {
        accessToken,
        refreshToken: nextRefreshToken,
    };
});
const logout = (token) => __awaiter(void 0, void 0, void 0, function* () {
    if (token) {
        yield prisma_1.default.refreshToken.deleteMany({ where: { token } });
    }
});
exports.AuthService = {
    registerUser,
    loginUser,
    refreshToken,
    logout,
};
