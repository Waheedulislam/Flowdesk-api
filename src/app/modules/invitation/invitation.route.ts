import express from "express";
import { InvitationController } from "./invitation.controller";
import { InvitationValidation } from "./invitation.validation";
import { auth } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";

const router = express.Router();

router.post(
  "/workspace/:workspaceId",
  auth(),
  validateRequest(InvitationValidation.createInvitationValidationSchema),
  InvitationController.createInvitation,
);
router.get(
  "/workspace/:workspaceId",
  auth(),
  InvitationController.getWorkspaceInvitations,
);

router.post(
  "/workspace/:token/accept",
  auth(),
  InvitationController.acceptInvitation,
);

export const InvitationRoutes = router;
