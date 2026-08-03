import z from "zod";

const createProjectValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Project name is required").max(100),
    description: z.string().optional(),
  }),
});
const updateProjectValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Project name cannot be empty")
      .max(100)
      .optional(),

    description: z.string().trim().optional(),

    status: z
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

export const projectValidation = {
  createProjectValidationSchema,
  updateProjectValidationSchema,
};
