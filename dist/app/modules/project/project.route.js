"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const project_controller_1 = require("./project.controller");
const project_validation_1 = require("./project.validation");
const project_member_route_1 = require("./project-member/project-member.route");
const router = express_1.default.Router();
// create project
router.post("/workspace/:workspaceId", (0, auth_1.auth)(), (0, validateRequest_1.default)(project_validation_1.projectValidation.createProjectValidationSchema), project_controller_1.ProjectController.createProject);
// get all project
router.get("/workspace/:workspaceId", (0, auth_1.auth)(), project_controller_1.ProjectController.getProjects);
// get single project
router.get("/:projectId", (0, auth_1.auth)(), project_controller_1.ProjectController.getSingleProject);
// update project
router.patch("/:projectId", (0, auth_1.auth)(), (0, validateRequest_1.default)(project_validation_1.projectValidation.updateProjectValidationSchema), project_controller_1.ProjectController.updateProject);
// delete project
router.delete("/:projectId", (0, auth_1.auth)(), project_controller_1.ProjectController.deleteProject);
// project member routes details
router.use("/", project_member_route_1.ProjectMemberRoutes);
exports.ProjectRoutes = router;
