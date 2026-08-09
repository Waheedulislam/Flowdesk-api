import express from "express";
import { AnalyticsController } from "./analytics.controller";
import { auth } from "../../middleware/auth";

const router = express.Router();

router.get(
  "/workspace/:workspaceId",
  auth(),
  AnalyticsController.getWorkspaceAnalytics,
);

export const AnalyticsRoutes = router;
