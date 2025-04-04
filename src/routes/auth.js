const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middlewares/auth");
const { upload, uploadToAppwrite } = require("../middlewares/upload");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
// Rute register-admin dinonaktifkan karena implementasi controller belum lengkap
// router.post("/register-admin", authController.registerAdmin);

// Protected routes
router.get("/me", authenticate, authController.getMe);
router.put("/update-profile", authenticate, authController.updateProfile);
router.put("/change-password", authenticate, authController.changePassword);
router.put(
  "/update-profile-picture",
  authenticate,
  upload.single("profile_image"),
  uploadToAppwrite(),
  authController.updateProfilePicture
);

module.exports = router;
