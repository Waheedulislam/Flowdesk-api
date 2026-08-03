import z from "zod";

const createProjectValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Project name is required").max(100),
    description: z.string().optional(),
  }),
});

export const projectValidation = {
  createProjectValidationSchema,
};
