const express = require("express");
const router = express.Router();
const notifikasiController = require("../controllers/notifikasiController");
const { authenticate } = require("../middlewares/auth");

// All routes require authentication
router.use(authenticate);

// Get all notifications for the current user
router.get("/", notifikasiController.getUserNotifications);

// Get unread notification count
router.get("/unread-count", notifikasiController.getUnreadCount);

// Get notification by ID
router.get("/:id", notifikasiController.getNotificationById);

// Mark notification as read
router.patch("/:id/read", notifikasiController.markAsRead);

// Mark all notifications as read
router.patch("/read-all", notifikasiController.markAllAsRead);

// Delete notification
router.delete("/:id", notifikasiController.deleteNotification);

module.exports = router;
