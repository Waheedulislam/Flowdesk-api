import express from "express";
import { auth } from "../../../middleware/auth";
import validateRequest from "../../../middleware/validateRequest";
import { ProjectMemberController } from "./project-member.controller";
import { ProjectMemberValidation } from "./project-member.validation";

const router = express.Router();

// Add Member
router.post(
  "/:projectId/members",
  auth(),
  validateRequest(ProjectMemberValidation.addProjectMemberValidationSchema),
  ProjectMemberController.addProjectMember,
);

// Get Members
router.get(
  "/:projectId/members",
  auth(),
  ProjectMemberController.getProjectMembers,
);

// Update Member Role
router.patch(
  "/members/:memberId",
  auth(),
  validateRequest(ProjectMemberValidation.updateProjectMemberValidationSchema),
  ProjectMemberController.updateProjectMemberRole,
);

// Remove Member
router.delete(
  "/members/:memberId",
  auth(),
  ProjectMemberController.removeProjectMember,
);

export const ProjectMemberRoutes = router;
