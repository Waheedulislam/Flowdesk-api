"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectMemberValidation = void 0;
const zod_1 = require("zod");
const addProjectMemberValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.string().uuid(),
        role: zod_1.z.enum(["PROJECT_ADMIN", "DEVELOPER", "VIEWER"]),
    }),
});
const updateProjectMemberValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        role: zod_1.z.enum(["PROJECT_ADMIN", "DEVELOPER", "VIEWER"]),
    }),
});
exports.ProjectMemberValidation = {
    addProjectMemberValidationSchema,
    updateProjectMemberValidationSchema,
};
