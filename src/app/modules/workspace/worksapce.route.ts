import express from "express";
import { WorkspaceController } from "./workspace.controller";
import { WorkspaceValidation } from "./workspace.validation";
import { auth } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";

const router = express.Router();

router.get("/", auth(), WorkspaceController.getMyWorkspaces);

router.get("/:slug", auth(), WorkspaceController.getWorkspaceBySlug);

router.get(
  "/:workspaceId/members",
  auth(),
  WorkspaceController.getWorkspaceMembers,
);

router.post(
  "/create-workspaces",
  auth(),
  validateRequest(WorkspaceValidation.createWorkspaceValidationSchema),
  WorkspaceController.createWorkspace,
);
router.patch(
  "/:workspaceId/members/:memberId/role",
  auth(),
  validateRequest(WorkspaceValidation.updateMemberRoleValidationSchema),
  WorkspaceController.updateMemberRole,
);
router.delete(
  "/:workspaceId/members/:memberId",
  auth(),
  WorkspaceController.removeMember,
);
router.post("/:workspaceId/leave", auth(), WorkspaceController.leaveWorkspace);

export const WorkspaceRoutes = router;
