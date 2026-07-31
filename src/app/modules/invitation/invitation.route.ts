import express from "express";
import { InvitationController } from "./invitation.controller";
import { InvitationValidation } from "./invitation.validation";
import { auth } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";

const router = express.Router();

router.post(
  "/:workspaceId/invitations",
  auth(),
  validateRequest(InvitationValidation.createInvitationValidationSchema),
  InvitationController.createInvitation,
);

export const InvitationRoutes = router;
