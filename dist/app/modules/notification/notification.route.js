"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const notification_controller_1 = require("./notification.controller");
const router = express_1.default.Router();
// Get My Notifications
router.get("/", (0, auth_1.auth)(), notification_controller_1.NotificationController.getMyNotifications);
// Mark Single Notification As Read
router.patch("/:notificationId/read", (0, auth_1.auth)(), notification_controller_1.NotificationController.markAsRead);
// Mark All Notifications As Read
router.patch("/read-all", (0, auth_1.auth)(), notification_controller_1.NotificationController.markAllAsRead);
// Delete Notification
router.delete("/:notificationId", (0, auth_1.auth)(), notification_controller_1.NotificationController.deleteNotification);
exports.NotificationRoutes = router;
