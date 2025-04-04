// Controller for handling report (laporan) operations
const { Laporan, User, sequelize, Notifikasi } = require("../models");
const { Op } = require("sequelize");

// Create a new report
exports.createLaporan = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { terlapor_id, alasan } = req.body;
    const pelapor_id = req.user.user_id;

    // Check if reported user exists
    const terlapor = await User.findByPk(terlapor_id);
    if (!terlapor) {
      await t.rollback();
      return res.error("Reported user not found", null, 404);
    }

    // Prevent reporting self
    if (terlapor_id === pelapor_id) {
      await t.rollback();
      return res.error("You cannot report yourself", null, 400);
    }

    // Create report
    const laporan = await Laporan.create(
      {
        pelapor_id,
        terlapor_id,
        alasan,
        status: "pending",
      },
      { transaction: t }
    );

    // Find admin users
    const admins = await User.findAll({
      where: {
        role: "admin",
      },
    });

    // Create notifications for admins
    const notificationPromises = admins.map((admin) => {
      return Notifikasi.create(
        {
          user_id: admin.user_id,
          judul: "New User Report",
          pesan: `A new report has been filed by ${req.user.nama} against user #${terlapor_id}`,
          dibaca: false,
        },
        { transaction: t }
      );
    });

    await Promise.all(notificationPromises);

    await t.commit();

    return res.success("Report submitted successfully", laporan, null, 201);
  } catch (error) {
    await t.rollback();
    console.error("Create report error:", error);
    return res.error("Error submitting report", error);
  }
};

// Get all reports (admin only)
exports.getAllLaporan = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: reports } = await Laporan.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "pelapor",
          attributes: ["user_id", "nama", "email", "profile_picture"],
        },
        {
          model: User,
          as: "terlapor",
          attributes: ["user_id", "nama", "email", "profile_picture"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    return res.success(
      "Reports retrieved successfully",
      reports,
      res.paginate(count, page, limit)
    );
  } catch (error) {
    console.error("Get all reports error:", error);
    return res.error("Error fetching reports", error);
  }
};

// Get report by ID (admin or reporter)
exports.getLaporanById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;
    const isAdmin = req.user.role === "admin";

    const report = await Laporan.findOne({
      where: {
        laporan_id: id,
      },
      include: [
        {
          model: User,
          as: "pelapor",
          attributes: ["user_id", "nama", "email", "profile_picture"],
        },
        {
          model: User,
          as: "terlapor",
          attributes: ["user_id", "nama", "email", "profile_picture"],
        },
      ],
    });

    if (!report) {
      return res.error("Report not found", null, 404);
    }

    // Check authorization
    if (!isAdmin && report.pelapor_id !== user_id) {
      return res.error("You are not authorized to view this report", null, 403);
    }

    return res.success("Report retrieved successfully", report);
  } catch (error) {
    console.error("Get report error:", error);
    return res.error("Error fetching report", error);
  }
};

// Get reports by user (admin or the reporter)
exports.getUserLaporan = async (req, res) => {
  try {
    const { user_id } = req.params;
    const current_user_id = req.user.user_id;
    const isAdmin = req.user.role === "admin";
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Check authorization
    if (!isAdmin && parseInt(user_id) !== current_user_id) {
      return res.error(
        "You are not authorized to view these reports",
        null,
        403
      );
    }

    const { count, rows: reports } = await Laporan.findAndCountAll({
      where: {
        pelapor_id: user_id,
      },
      include: [
        {
          model: User,
          as: "terlapor",
          attributes: ["user_id", "nama", "profile_picture"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    return res.success(
      "User reports retrieved successfully",
      reports,
      res.paginate(count, page, limit)
    );
  } catch (error) {
    console.error("Get user reports error:", error);
    return res.error("Error fetching user reports", error);
  }
};

// Update report status (admin only)
exports.updateStatus = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["pending", "diproses", "ditolak", "diterima"];
    if (!validStatuses.includes(status)) {
      await t.rollback();
      return res.error("Invalid status value", null, 400);
    }

    const report = await Laporan.findByPk(id);

    if (!report) {
      await t.rollback();
      return res.error("Report not found", null, 404);
    }

    // Update report status
    await report.update(
      {
        status,
      },
      { transaction: t }
    );

    // Create notification for the reporter
    await Notifikasi.create(
      {
        user_id: report.pelapor_id,
        judul: "Report Status Update",
        pesan: `Your report #${id} status has been updated to: ${status}`,
        dibaca: false,
      },
      { transaction: t }
    );

    await t.commit();

    return res.success("Report status updated successfully", report);
  } catch (error) {
    await t.rollback();
    console.error("Update report status error:", error);
    return res.error("Error updating report status", error);
  }
};
