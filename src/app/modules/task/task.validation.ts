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

export const TaskValidation = {
  createTaskValidationSchema,
};
