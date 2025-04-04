const { Transaksi, Barang, User, sequelize, Notifikasi } = require("../models");
const { Op } = require("sequelize");

// Create a new transaction
exports.createTransaksi = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { barang_id, metode_pembayaran, catatan } = req.body;
    const buyer_id = req.user.user_id;

    // Check if item exists
    const barang = await Barang.findOne({
      where: {
        barang_id,
        status: "tersedia",
        status_delete: false,
      },
    });

    if (!barang) {
      await t.rollback();
      return res.error("Item not found or not available", null, 404);
    }

    // Check if buyer is not the seller
    if (barang.user_id === buyer_id) {
      await t.rollback();
      return res.error("You cannot buy your own item", null, 400);
    }

    // Create transaction
    const transaksi = await Transaksi.create(
      {
        barang_id,
        seller_id: barang.user_id,
        buyer_id,
        metode_pembayaran,
        total_harga: barang.harga,
        status: "pending",
        catatan,
      },
      { transaction: t }
    );

    // Update item status
    await barang.update(
      {
        status: "dipesan",
      },
      { transaction: t }
    );

    await t.commit();

    return res.success(
      "Transaction created successfully",
      transaksi,
      null,
      201
    );
  } catch (error) {
    await t.rollback();
    console.error("Create transaction error:", error);
    return res.error("Error creating transaction", error);
  }
};

// Get all transactions for a user (as buyer or seller)
exports.getUserTransaksi = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { role, status, page = 1, limit = 10 } = req.query;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build where condition
    const whereConditions = {};

    if (role === "buyer") {
      whereConditions.buyer_id = user_id;
    } else if (role === "seller") {
      whereConditions.seller_id = user_id;
    } else {
      whereConditions[Op.or] = [{ buyer_id: user_id }, { seller_id: user_id }];
    }

    if (status) {
      whereConditions.status = status;
    }

    // Find transactions
    const { count, rows: transaksi } = await Transaksi.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Barang,
          as: "barang",
          attributes: ["barang_id", "judul", "foto", "harga"],
        },
        {
          model: User,
          as: "penjual",
          attributes: ["user_id", "nama", "email", "profile_picture"],
        },
        {
          model: User,
          as: "pembeli",
          attributes: ["user_id", "nama", "email", "profile_picture"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.success(
      "Transactions retrieved successfully",
      transaksi,
      res.paginate(count, page, limit)
    );
  } catch (error) {
    console.error("Get user transactions error:", error);
    return res.error("Error fetching transactions", error);
  }
};

// Get transaction by ID
exports.getTransaksiById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;

    const transaksi = await Transaksi.findOne({
      where: { transaksi_id: id },
      include: [
        {
          model: Barang,
          as: "barang",
          attributes: [
            "barang_id",
            "judul",
            "deskripsi",
            "foto",
            "harga",
            "kondisi",
          ],
        },
        {
          model: User,
          as: "penjual",
          attributes: [
            "user_id",
            "nama",
            "email",
            "profile_picture",
            "nomor_telepon",
          ],
        },
        {
          model: User,
          as: "pembeli",
          attributes: [
            "user_id",
            "nama",
            "email",
            "profile_picture",
            "nomor_telepon",
          ],
        },
      ],
    });

    if (!transaksi) {
      return res.error("Transaction not found", null, 404);
    }

    // Check if user is involved in the transaction
    if (
      transaksi.buyer_id !== user_id &&
      transaksi.seller_id !== user_id &&
      req.user.role !== "admin"
    ) {
      return res.error(
        "You do not have permission to view this transaction",
        null,
        403
      );
    }

    return res.success("Transaction retrieved successfully", transaksi);
  } catch (error) {
    console.error("Get transaction error:", error);
    return res.error("Error fetching transaction", error);
  }
};

// Update transaction status
exports.updateTransaksiStatus = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { status } = req.body;
    const user_id = req.user.user_id;

    // Check if new status is valid
    const validStatuses = [
      "dibayar",
      "diproses",
      "dikirim",
      "selesai",
      "dibatalkan",
    ];
    if (!validStatuses.includes(status)) {
      await t.rollback();
      return res.error("Invalid status", null, 400);
    }

    // Find transaction
    const transaksi = await Transaksi.findByPk(id, { transaction: t });

    if (!transaksi) {
      await t.rollback();
      return res.error("Transaction not found", null, 404);
    }

    // Check permissions
    const isBuyer = transaksi.buyer_id === user_id;
    const isSeller = transaksi.seller_id === user_id;
    const isAdmin = req.user.role === "admin";

    if (!isBuyer && !isSeller && !isAdmin) {
      await t.rollback();
      return res.error(
        "You do not have permission to update this transaction",
        null,
        403
      );
    }

    // Check status transition permissions
    if (status === "dibayar" && !isBuyer && !isAdmin) {
      await t.rollback();
      return res.error(
        "Only the buyer can mark a transaction as paid",
        null,
        403
      );
    }

    if (
      (status === "diproses" || status === "dikirim") &&
      !isSeller &&
      !isAdmin
    ) {
      await t.rollback();
      return res.error(
        "Only the seller can process or ship an item",
        null,
        403
      );
    }

    if (status === "selesai" && !isBuyer && !isAdmin) {
      await t.rollback();
      return res.error("Only the buyer can complete a transaction", null, 403);
    }

    // Update transaction status
    await transaksi.update({ status }, { transaction: t });

    // Update item status if transaction is completed or cancelled
    if (status === "selesai" || status === "dibatalkan") {
      const barang = await Barang.findByPk(transaksi.barang_id, {
        transaction: t,
      });

      if (status === "selesai") {
        await barang.update({ status: "terjual" }, { transaction: t });
      } else if (status === "dibatalkan") {
        await barang.update({ status: "tersedia" }, { transaction: t });
      }
    }

    await t.commit();

    return res.success("Transaction status updated successfully", transaksi);
  } catch (error) {
    await t.rollback();
    console.error("Update transaction status error:", error);
    return res.error("Error updating transaction status", error);
  }
};
