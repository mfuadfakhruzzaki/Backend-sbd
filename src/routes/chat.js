const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { authenticate } = require("../middlewares/auth");

// All routes require authentication
router.use(authenticate);

// Get conversations list
router.get("/conversations", chatController.getConversationsList);

// Get unread messages count
router.get("/unread-count", chatController.getUnreadCount);

// Get conversation with a specific user
router.get("/conversation/:user_id", chatController.getConversation);

// Send a message
router.post("/", chatController.sendMessage);

// Delete a message
router.delete("/:id", chatController.deleteMessage);

module.exports = router;
