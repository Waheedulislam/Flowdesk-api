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

export const TaskRoutes = router;
