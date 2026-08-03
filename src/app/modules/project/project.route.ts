import express from "express";
import { auth } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { ProjectController } from "./project.controller";
import { projectValidation } from "./project.validation";

const router = express.Router();

// create project
router.post(
  "/workspace/:workspaceId",
  auth(),
  validateRequest(projectValidation.createProjectValidationSchema),
  ProjectController.createProject,
);
// get all project
router.get("/workspace/:workspaceId", auth(), ProjectController.getProjects);

// get single project
router.get("/:projectId", auth(), ProjectController.getSingleProject);

// update project
router.patch(
  "/:projectId",
  auth(),
  validateRequest(projectValidation.updateProjectValidationSchema),
  ProjectController.updateProject,
);

// delete project
router.delete("/:projectId", auth(), ProjectController.deleteProject);

export const ProjectRoutes = router;
