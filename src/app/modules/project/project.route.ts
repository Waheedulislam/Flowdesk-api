import express from "express";
import { auth } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { ProjectController } from "./project.controller";
import { projectValidation } from "./project.validation";

const router = express.Router();

router.post(
  "/workspace/:workspaceId",
  auth(),
  validateRequest(projectValidation.createProjectValidationSchema),
  ProjectController.createProject,
);
router.get(
  "/workspace/:workspaceId",
  auth(),
  ProjectController.getProjects,
);


export const ProjectRoutes = router;
