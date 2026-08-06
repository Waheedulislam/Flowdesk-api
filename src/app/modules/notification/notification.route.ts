import express from "express";
import { auth } from "../../middleware/auth";
import { NotificationController } from "./notification.controller";

const router = express.Router();

// Get My Notifications
router.get("/", auth(), NotificationController.getMyNotifications);

// Mark Single Notification As Read
router.patch(
  "/:notificationId/read",
  auth(),
  NotificationController.markAsRead,
);

// Mark All Notifications As Read
router.patch("/read-all", auth(), NotificationController.markAllAsRead);

// Delete Notification
router.delete(
  "/:notificationId",
  auth(),
  NotificationController.deleteNotification,
);

export const NotificationRoutes = router;
