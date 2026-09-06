"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const activity_log_controller_1 = require("./activity-log.controller");
const router = express_1.default.Router();
router.get("/workspace/:workspaceId", (0, auth_1.auth)(), activity_log_controller_1.ActivityLogController.getActivityLogs);
exports.ActivityLogRoutes = router;
