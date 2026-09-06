"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const task_controller_1 = require("./task.controller");
const task_validation_1 = require("./task.validation");
const comment_route_1 = require("./comment/comment.route");
const router = express_1.default.Router();
router.post("/project/:projectId", (0, auth_1.auth)(), (0, validateRequest_1.default)(task_validation_1.TaskValidation.createTaskValidationSchema), task_controller_1.TaskController.createTask);
// get all tasks
router.get("/project/:projectId", (0, auth_1.auth)(), task_controller_1.TaskController.getTasks);
// get single task
router.get("/:taskId", (0, auth_1.auth)(), task_controller_1.TaskController.getSingleTask);
// update task
router.patch("/:taskId", (0, auth_1.auth)(), (0, validateRequest_1.default)(task_validation_1.TaskValidation.updateTaskValidationSchema), task_controller_1.TaskController.updateTask);
router.delete("/:taskId", (0, auth_1.auth)(), task_controller_1.TaskController.deleteTask);
// task comment details
router.use("/", comment_route_1.CommentRoutes);
exports.TaskRoutes = router;
