const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");
const { authenticate } = require("../middlewares/auth");

// Public routes
router.get("/user/:user_id", ratingController.getUserRatings);
router.get("/user/:user_id/stats", ratingController.getUserRatingStats);
router.get("/transaction/:transaksi_id", ratingController.getTransactionRating);

// Protected routes
router.use(authenticate);
router.post("/", ratingController.createRating);
router.put("/:rating_id", ratingController.updateRating);
router.delete("/:rating_id", ratingController.deleteRating);

module.exports = router;
