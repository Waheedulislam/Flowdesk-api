import { z } from "zod";
import { WorkspaceRole } from "../../../generated/prisma";

const createInvitationValidationSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email address"),
    role: z.nativeEnum(WorkspaceRole),
  }),
});

export const InvitationValidation = {
  createInvitationValidationSchema,
};
