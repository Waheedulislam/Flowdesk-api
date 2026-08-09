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

router.get(
  "/members/:workspaceId",
  auth(),
  AnalyticsController.getMemberAnalytics,
);
export const AnalyticsRoutes = router;
