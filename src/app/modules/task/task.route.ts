import express from "express";
import { auth } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { TaskController } from "./task.controller";
import { TaskValidation } from "./task.validation";

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

export const TaskRoutes = router;
