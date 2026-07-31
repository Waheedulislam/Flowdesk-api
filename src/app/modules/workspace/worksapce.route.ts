import express from "express";
import { WorkspaceController } from "./workspace.controller";
import { WorkspaceValidation } from "./workspace.validation";
import { auth } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";

const router = express.Router();

router.get("/", auth(), WorkspaceController.getMyWorkspaces);

router.get("/:slug", auth(), WorkspaceController.getWorkspaceBySlug);

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

export const WorkspaceRoutes = router;
