import { z } from "zod";

const createWorkspaceValidationSchema = z.object({
  body: z.object({
    name: z
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

    description: z
      .string()
      .trim()
      .max(300, {
        error: "Description cannot exceed 300 characters",
      })
      .optional(),

    logo: z.string().url("Logo must be a valid URL").optional(),
  }),
});

const updateMemberRoleValidationSchema = z.object({
  body: z.object({
    role: z.enum(["ADMIN", "MEMBER"]),
  }),
});

export const WorkspaceValidation = {
  createWorkspaceValidationSchema,
  updateMemberRoleValidationSchema,
};
