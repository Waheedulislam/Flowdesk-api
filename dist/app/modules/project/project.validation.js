"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const createProjectValidationSchema = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default.string().trim().min(1, "Project name is required").max(100),
        description: zod_1.default.string().optional(),
    }),
});
const updateProjectValidationSchema = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default
            .string()
            .trim()
            .min(1, "Project name cannot be empty")
            .max(100)
            .optional(),
        description: zod_1.default.string().trim().optional(),
        status: zod_1.default
            .enum([
            "PLANNING",
            "ACTIVE",
            "IN_PROGRESS",
            "ON_HOLD",
            "COMPLETED",
            "ARCHIVED",
        ])
            .optional(),
    }),
});
exports.projectValidation = {
    createProjectValidationSchema,
    updateProjectValidationSchema,
};
