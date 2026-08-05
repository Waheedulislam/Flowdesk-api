import { z } from "zod";

const createTaskValidationSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Task title is required").max(200),

    description: z.string().optional(),

    assignedTo: z.string().uuid().optional(),

    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),

    dueDate: z.string().datetime().optional(),
  }),
});
const updateTaskValidationSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    assignedTo: z.string().uuid().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
    dueDate: z.string().datetime().optional(),
  }),
});

export const TaskValidation = {
  createTaskValidationSchema,
  updateTaskValidationSchema,
};
