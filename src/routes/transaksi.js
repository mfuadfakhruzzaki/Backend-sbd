const express = require("express");
const router = express.Router();
const transaksiController = require("../controllers/transaksiController");
const { authenticate } = require("../middlewares/auth");

// All routes require authentication
router.use(authenticate);

// Transaction routes
router.post("/", transaksiController.createTransaksi);
router.get("/", transaksiController.getUserTransaksi);
router.get("/:id", transaksiController.getTransaksiById);
router.put("/:id/status", transaksiController.updateTransaksiStatus);

module.exports = router;
