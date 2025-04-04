const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const { authenticate } = require("../middlewares/auth");

// All routes require authentication
router.use(authenticate);

// Get user's wishlist
router.get("/", wishlistController.getUserWishlist);

// Check if item is in wishlist
router.get("/check/:barang_id", wishlistController.checkWishlist);

// Add item to wishlist
router.post("/", wishlistController.addToWishlist);

// Remove item from wishlist
router.delete("/:barang_id", wishlistController.removeFromWishlist);

// Clear wishlist
router.delete("/", wishlistController.clearWishlist);

module.exports = router;
