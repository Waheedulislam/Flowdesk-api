"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const registerSchema = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default
            .string()
            .min(3, "Name must be at least 3 characters")
            .max(50, "Name cannot exceed 50 characters"),
        email: zod_1.default.email("Invalid email address").trim().toLowerCase(),
        password: zod_1.default
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(100, "Password cannot exceed 100 characters"),
    }),
});
const loginValidationSchema = zod_1.default.object({
    body: zod_1.default.object({
        email: zod_1.default.email("Invalid email address").trim().toLowerCase(),
        password: zod_1.default.string().min(1, "Password is required"),
    }),
});
exports.AuthValidation = {
    registerSchema,
    loginValidationSchema,
};
