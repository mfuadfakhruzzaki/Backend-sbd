const { Wishlist, Barang, User, Kategori, sequelize } = require("../models");
const { Op } = require("sequelize");

// Add item to wishlist
exports.addToWishlist = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { barang_id } = req.body;
    const user_id = req.user.user_id;

    // Check if item exists
    const barang = await Barang.findOne({
      where: {
        barang_id,
        status_delete: false,
      },
    });

    if (!barang) {
      await t.rollback();
      return res.error("Item not found", null, 404);
    }

    // Check if item already in wishlist
    const existingWishlist = await Wishlist.findOne({
      where: {
        user_id,
        barang_id,
      },
    });

    if (existingWishlist) {
      await t.rollback();
      return res.error("Item already in wishlist", null, 400);
    }

    // Create wishlist entry
    const wishlist = await Wishlist.create(
      {
        user_id,
        barang_id,
      },
      { transaction: t }
    );

    await t.commit();

    return res.success(
      "Item added to wishlist successfully",
      wishlist,
      null,
      201
    );
  } catch (error) {
    await t.rollback();
    console.error("Add to wishlist error:", error);
    return res.error("Error adding item to wishlist", error);
  }
};

// Get user's wishlist
exports.getUserWishlist = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: wishlistItems } = await Wishlist.findAndCountAll({
      where: {
        user_id,
      },
      include: [
        {
          model: Barang,
          as: "barang",
          where: {
            status_delete: false,
          },
          include: [
            {
              model: User,
              as: "pemilik",
              attributes: ["user_id", "nama", "profile_picture"],
            },
            {
              model: Kategori,
              as: "kategori",
              attributes: ["kategori_id", "nama_kategori"],
            },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    return res.success(
      "Wishlist retrieved successfully",
      wishlistItems,
      res.paginate(count, page, limit)
    );
  } catch (error) {
    console.error("Get wishlist error:", error);
    return res.error("Error fetching wishlist", error);
  }
};

// Check if item is in wishlist
exports.checkWishlist = async (req, res) => {
  try {
    const { barang_id } = req.params;
    const user_id = req.user.user_id;

    const wishlist = await Wishlist.findOne({
      where: {
        user_id,
        barang_id,
      },
    });

    return res.success("Wishlist check completed", {
      in_wishlist: !!wishlist,
    });
  } catch (error) {
    console.error("Check wishlist error:", error);
    return res.error("Error checking wishlist status", error);
  }
};

// Remove item from wishlist
exports.removeFromWishlist = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { barang_id } = req.params;
    const user_id = req.user.user_id;

    const wishlist = await Wishlist.findOne({
      where: {
        user_id,
        barang_id,
      },
    });

    if (!wishlist) {
      await t.rollback();
      return res.error("Item not found in wishlist", null, 404);
    }

    // Delete wishlist entry
    await wishlist.destroy({ transaction: t });

    await t.commit();

    return res.success("Item removed from wishlist successfully");
  } catch (error) {
    await t.rollback();
    console.error("Remove from wishlist error:", error);
    return res.error("Error removing item from wishlist", error);
  }
};

// Clear wishlist
exports.clearWishlist = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const user_id = req.user.user_id;

    // Delete all wishlist entries for user
    await Wishlist.destroy({
      where: {
        user_id,
      },
      transaction: t,
    });

    await t.commit();

    return res.success("Wishlist cleared successfully");
  } catch (error) {
    await t.rollback();
    console.error("Clear wishlist error:", error);
    return res.error("Error clearing wishlist", error);
  }
};
