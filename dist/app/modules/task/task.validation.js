"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskValidation = void 0;
const zod_1 = require("zod");
const createTaskValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().trim().min(1, "Task title is required").max(200),
        description: zod_1.z.string().optional(),
        assignedTo: zod_1.z.string().uuid().optional(),
        priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
        dueDate: zod_1.z.string().datetime().optional(),
    }),
});
const updateTaskValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).optional(),
        description: zod_1.z.string().optional(),
        assignedTo: zod_1.z.string().uuid().optional(),
        priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
        status: zod_1.z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
        dueDate: zod_1.z.string().datetime().optional(),
    }),
});
exports.TaskValidation = {
    createTaskValidationSchema,
    updateTaskValidationSchema,
};
