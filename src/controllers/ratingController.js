const { Rating, Transaksi, User, sequelize, Notifikasi } = require("../models");
const { Op } = require("sequelize");

// Create a new rating
exports.createRating = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { transaksi_id, nilai, komentar } = req.body;
    const reviewer_id = req.user.user_id;

    // Check if transaction exists and is completed
    const transaksi = await Transaksi.findOne({
      where: {
        transaksi_id,
        status: "selesai",
      },
    });

    if (!transaksi) {
      await t.rollback();
      return res.error("Transaction not found or not completed", null, 404);
    }

    // Check if the reviewer is part of the transaction
    if (
      transaksi.buyer_id !== reviewer_id &&
      transaksi.seller_id !== reviewer_id
    ) {
      await t.rollback();
      return res.error(
        "You are not authorized to rate this transaction",
        null,
        403
      );
    }

    // Determine who is being reviewed
    const reviewed_id =
      transaksi.buyer_id === reviewer_id
        ? transaksi.seller_id
        : transaksi.buyer_id;

    // Check if rating already exists
    const existingRating = await Rating.findOne({
      where: {
        transaksi_id,
        reviewer_id,
      },
    });

    if (existingRating) {
      await t.rollback();
      return res.error("You have already rated this transaction", null, 400);
    }

    // Create rating
    const rating = await Rating.create(
      {
        transaksi_id,
        reviewer_id,
        reviewed_id,
        nilai,
        komentar,
      },
      { transaction: t }
    );

    // Create notification for the reviewed user
    await Notifikasi.create(
      {
        user_id: reviewed_id,
        judul: "New Rating Received",
        pesan: `You have received a ${nilai}-star rating for transaction #${transaksi_id}`,
        dibaca: false,
      },
      { transaction: t }
    );

    await t.commit();

    return res.success("Rating submitted successfully", rating, null, 201);
  } catch (error) {
    await t.rollback();
    console.error("Create rating error:", error);
    return res.error("Error submitting rating", error);
  }
};

// Get all ratings for a user
exports.getUserRatings = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: ratings } = await Rating.findAndCountAll({
      where: {
        reviewed_id: user_id,
      },
      include: [
        {
          model: User,
          as: "reviewer",
          attributes: ["user_id", "nama", "email", "profile_picture"],
        },
        {
          model: Transaksi,
          as: "transaksi",
          attributes: ["transaksi_id", "barang_id", "tanggal_transaksi"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    return res.success(
      "Ratings retrieved successfully",
      ratings,
      res.paginate(count, page, limit)
    );
  } catch (error) {
    console.error("Get user ratings error:", error);
    return res.error("Error fetching user ratings", error);
  }
};

// Get rating for a specific transaction
exports.getTransactionRating = async (req, res) => {
  try {
    const { transaksi_id } = req.params;

    const rating = await Rating.findOne({
      where: {
        transaksi_id,
      },
      include: [
        {
          model: User,
          as: "reviewer",
          attributes: ["user_id", "nama", "profile_picture"],
        },
        {
          model: User,
          as: "reviewed",
          attributes: ["user_id", "nama", "profile_picture"],
        },
      ],
    });

    if (!rating) {
      return res.error("Rating not found", null, 404);
    }

    return res.success("Rating retrieved successfully", rating);
  } catch (error) {
    console.error("Get transaction rating error:", error);
    return res.error("Error fetching transaction rating", error);
  }
};

// Update a rating
exports.updateRating = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { rating_id } = req.params;
    const { nilai, komentar } = req.body;
    const reviewer_id = req.user.user_id;

    // Check if rating exists and belongs to the reviewer
    const rating = await Rating.findOne({
      where: {
        rating_id,
        reviewer_id,
      },
    });

    if (!rating) {
      await t.rollback();
      return res.error("Rating not found or not authorized", null, 404);
    }

    // Update rating
    await rating.update(
      {
        nilai,
        komentar,
      },
      { transaction: t }
    );

    // Create notification for the reviewed user
    await Notifikasi.create(
      {
        user_id: rating.reviewed_id,
        judul: "Rating Updated",
        pesan: `A rating for your transaction has been updated to ${nilai} stars`,
        dibaca: false,
      },
      { transaction: t }
    );

    await t.commit();

    return res.success("Rating updated successfully", rating);
  } catch (error) {
    await t.rollback();
    console.error("Update rating error:", error);
    return res.error("Error updating rating", error);
  }
};

// Delete a rating
exports.deleteRating = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { rating_id } = req.params;
    const reviewer_id = req.user.user_id;

    // Check if rating exists and belongs to the reviewer
    const rating = await Rating.findOne({
      where: {
        rating_id,
        reviewer_id,
      },
    });

    if (!rating) {
      await t.rollback();
      return res.error("Rating not found or not authorized", null, 404);
    }

    // Delete rating
    await rating.destroy({ transaction: t });

    await t.commit();

    return res.success("Rating deleted successfully");
  } catch (error) {
    await t.rollback();
    console.error("Delete rating error:", error);
    return res.error("Error deleting rating", error);
  }
};

// Get rating statistics for a user
exports.getUserRatingStats = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Count total ratings
    const totalRatings = await Rating.count({
      where: {
        reviewed_id: user_id,
      },
    });

    // Calculate average rating
    const avgRating = await Rating.findOne({
      attributes: [
        [sequelize.fn("AVG", sequelize.col("nilai")), "average_rating"],
      ],
      where: {
        reviewed_id: user_id,
      },
      raw: true,
    });

    // Count ratings by star
    const ratingsByStarPromises = [1, 2, 3, 4, 5].map((star) =>
      Rating.count({
        where: {
          reviewed_id: user_id,
          nilai: star,
        },
      })
    );

    const ratingsByStar = await Promise.all(ratingsByStarPromises);

    const stats = {
      total_ratings: totalRatings,
      average_rating: parseFloat(avgRating.average_rating || 0).toFixed(1),
      ratings_distribution: {
        "1_star": ratingsByStar[0],
        "2_star": ratingsByStar[1],
        "3_star": ratingsByStar[2],
        "4_star": ratingsByStar[3],
        "5_star": ratingsByStar[4],
      },
    };

    return res.success("Rating statistics retrieved successfully", stats);
  } catch (error) {
    console.error("Get user rating stats error:", error);
    return res.error("Error fetching user rating statistics", error);
  }
};
