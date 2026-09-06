"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectMemberRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../../middleware/auth");
const validateRequest_1 = __importDefault(require("../../../middleware/validateRequest"));
const project_member_controller_1 = require("./project-member.controller");
const project_member_validation_1 = require("./project-member.validation");
const router = express_1.default.Router();
// Add Member
router.post("/:projectId/members", (0, auth_1.auth)(), (0, validateRequest_1.default)(project_member_validation_1.ProjectMemberValidation.addProjectMemberValidationSchema), project_member_controller_1.ProjectMemberController.addProjectMember);
// Get Members
router.get("/:projectId/members", (0, auth_1.auth)(), project_member_controller_1.ProjectMemberController.getProjectMembers);
// Update Member Role
router.patch("/members/:memberId", (0, auth_1.auth)(), (0, validateRequest_1.default)(project_member_validation_1.ProjectMemberValidation.updateProjectMemberValidationSchema), project_member_controller_1.ProjectMemberController.updateProjectMemberRole);
// Remove Member
router.delete("/members/:memberId", (0, auth_1.auth)(), project_member_controller_1.ProjectMemberController.removeProjectMember);
exports.ProjectMemberRoutes = router;
