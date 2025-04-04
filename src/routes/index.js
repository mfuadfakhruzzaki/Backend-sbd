const express = require("express");
const router = express.Router();

// Import route modules
const authRoutes = require("./auth");
const kategoriRoutes = require("./kategori");
const barangRoutes = require("./barang");
const transaksiRoutes = require("./transaksi");
const ratingRoutes = require("./rating");
const notifikasiRoutes = require("./notifikasi");
const wishlistRoutes = require("./wishlist");
const chatRoutes = require("./chat");
const laporanRoutes = require("./laporan");

// Default route
router.get("/", (req, res) => {
  res.success("Welcome to the E-Commerce Barang Bekas Mahasiswa API", {
    version: "1.0.0",
  });
});

// Register routes
router.use("/auth", authRoutes);
router.use("/kategori", kategoriRoutes);
router.use("/barang", barangRoutes);
router.use("/transaksi", transaksiRoutes);
router.use("/rating", ratingRoutes);
router.use("/notifikasi", notifikasiRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/chat", chatRoutes);
router.use("/laporan", laporanRoutes);

module.exports = router;
