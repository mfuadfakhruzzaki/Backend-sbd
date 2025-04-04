const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middlewares/auth");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes
router.get("/me", authenticate, authController.getMe);
router.put("/update-profile", authenticate, authController.updateProfile);
router.put("/change-password", authenticate, authController.changePassword);

module.exports = router;
