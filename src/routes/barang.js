const express = require("express");
const router = express.Router();
const barangController = require("../controllers/barangController");
const { authenticate, authorizeAdmin } = require("../middlewares/auth");
const { upload, uploadToAppwrite } = require("../middlewares/upload");

// Public routes
router.get("/", barangController.getAllBarang);
router.get("/:id", barangController.getBarangById);

// Protected routes
router.get("/user/items", authenticate, barangController.getUserItems);

// Upload routes with Appwrite storage
router.post(
  "/",
  authenticate,
  upload.array("foto", 5),
  uploadToAppwrite(),
  barangController.createBarang
);
router.put(
  "/:id",
  authenticate,
  upload.array("foto", 5),
  uploadToAppwrite(),
  barangController.updateBarang
);
router.delete("/:id", authenticate, barangController.softDeleteBarang);

// Admin routes
router.delete(
  "/:id/hard",
  authenticate,
  authorizeAdmin,
  barangController.hardDeleteBarang
);

module.exports = router;
