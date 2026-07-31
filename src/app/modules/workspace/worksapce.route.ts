import express from "express";
import { WorkspaceController } from "./workspace.controller";
import { WorkspaceValidation } from "./workspace.validation";
import { auth } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";

const router = express.Router();

router.post(
  "/create-workspaces",
  auth(),
  validateRequest(WorkspaceValidation.createWorkspaceValidationSchema),
  WorkspaceController.createWorkspace,
);
router.get("/", auth(), WorkspaceController.getMyWorkspaces);

export const WorkspaceRoutes = router;
