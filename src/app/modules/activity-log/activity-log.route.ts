import express from "express";
import { auth } from "../../middleware/auth";
import { ActivityLogController } from "./activity-log.controller";

const router = express.Router();

router.get(
  "/workspace/:workspaceId",
  auth(),
  ActivityLogController.getActivityLogs,
);

export const ActivityLogRoutes = router;
