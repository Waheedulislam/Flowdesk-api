"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const analytics_controller_1 = require("./analytics.controller");
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
router.get("/workspace/:workspaceId", (0, auth_1.auth)(), analytics_controller_1.AnalyticsController.getWorkspaceAnalytics);
router.get("/projects/:workspaceId", (0, auth_1.auth)(), analytics_controller_1.AnalyticsController.getProjectAnalytics);
router.get("/members/:workspaceId", (0, auth_1.auth)(), analytics_controller_1.AnalyticsController.getMemberAnalytics);
exports.AnalyticsRoutes = router;
