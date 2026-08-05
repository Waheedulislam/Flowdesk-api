import express from "express";
import { auth } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { TaskController } from "./task.controller";
import { TaskValidation } from "./task.validation";
import { CommentRoutes } from "./comment/comment.route";

const router = express.Router();

router.post(
  "/project/:projectId",
  auth(),
  validateRequest(TaskValidation.createTaskValidationSchema),
  TaskController.createTask,
);
// get all tasks
router.get("/project/:projectId", auth(), TaskController.getTasks);

// get single task
router.get("/:taskId", auth(), TaskController.getSingleTask);

// update task
router.patch(
  "/:taskId",
  auth(),
  validateRequest(TaskValidation.updateTaskValidationSchema),
  TaskController.updateTask,
);
router.delete("/:taskId", auth(), TaskController.deleteTask);

// task comment details
router.use("/", CommentRoutes);

export const TaskRoutes = router;
