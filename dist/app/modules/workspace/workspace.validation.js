"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceValidation = void 0;
const zod_1 = require("zod");
const createWorkspaceValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string({
            error: "Workspace name is required",
        })
            .trim()
            .min(3, {
            error: "Workspace name must be at least 3 characters",
        })
            .max(50, {
            error: "Workspace name cannot exceed 50 characters",
        }),
        description: zod_1.z
            .string()
            .trim()
            .max(300, {
            error: "Description cannot exceed 300 characters",
        })
            .optional(),
        logo: zod_1.z.string().url("Logo must be a valid URL").optional(),
    }),
});
const updateMemberRoleValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        role: zod_1.z.enum(["ADMIN", "MEMBER"]),
    }),
});
exports.WorkspaceValidation = {
    createWorkspaceValidationSchema,
    updateMemberRoleValidationSchema,
};
