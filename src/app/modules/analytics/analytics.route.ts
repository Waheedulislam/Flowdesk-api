import express from "express";
import { AnalyticsController } from "./analytics.controller";
import { auth } from "../../middleware/auth";

const router = express.Router();

router.get(
  "/workspace/:workspaceId",
  auth(),
  AnalyticsController.getWorkspaceAnalytics,
);

router.get(
  "/projects/:workspaceId",
  auth(),
  AnalyticsController.getProjectAnalytics,
);
export const AnalyticsRoutes = router;
