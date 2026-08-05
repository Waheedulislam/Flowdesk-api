import { z } from "zod";

const addProjectMemberValidationSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    role: z.enum(["PROJECT_ADMIN", "DEVELOPER", "VIEWER"]),
  }),
});

const updateProjectMemberValidationSchema = z.object({
  body: z.object({
    role: z.enum(["PROJECT_ADMIN", "DEVELOPER", "VIEWER"]),
  }),
});

export const ProjectMemberValidation = {
  addProjectMemberValidationSchema,
  updateProjectMemberValidationSchema,
};
