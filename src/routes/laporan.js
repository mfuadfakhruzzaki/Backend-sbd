const express = require("express");
const router = express.Router();
const laporanController = require("../controllers/laporanController");
const { authenticate, authorizeAdmin } = require("../middlewares/auth");

// All routes require authentication
router.use(authenticate);

// Routes for all authenticated users
router.post("/", laporanController.createLaporan);
router.get("/user/:user_id", laporanController.getUserLaporan);
router.get("/:id", laporanController.getLaporanById);

// Admin-only routes
router.get("/", authorizeAdmin, laporanController.getAllLaporan);
router.patch("/:id/status", authorizeAdmin, laporanController.updateStatus);

module.exports = router;
