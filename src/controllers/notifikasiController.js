const { Notifikasi, sequelize } = require("../models");
const { Op } = require("sequelize");

// Get all notifications for a user
exports.getUserNotifications = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { page = 1, limit = 10, is_read } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { user_id };
    if (is_read !== undefined) {
      whereClause.dibaca = is_read === "true";
    }

    const { count, rows: notifications } = await Notifikasi.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    return res.success(
      "Notifications retrieved successfully",
      notifications,
      res.paginate(count, page, limit)
    );
  } catch (error) {
    console.error("Get user notifications error:", error);
    return res.error("Error fetching notifications", error);
  }
};

// Get notification by ID
exports.getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;

    const notification = await Notifikasi.findOne({
      where: {
        notifikasi_id: id,
        user_id,
      },
    });

    if (!notification) {
      return res.error("Notification not found", null, 404);
    }

    return res.success("Notification retrieved successfully", notification);
  } catch (error) {
    console.error("Get notification error:", error);
    return res.error("Error fetching notification", error);
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const user_id = req.user.user_id;

    const notification = await Notifikasi.findOne({
      where: {
        notifikasi_id: id,
        user_id,
      },
    });

    if (!notification) {
      await t.rollback();
      return res.error("Notification not found", null, 404);
    }

    // Mark as read
    await notification.update(
      {
        dibaca: true,
      },
      { transaction: t }
    );

    await t.commit();

    return res.success("Notification marked as read", notification);
  } catch (error) {
    await t.rollback();
    console.error("Mark notification as read error:", error);
    return res.error("Error marking notification as read", error);
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const user_id = req.user.user_id;

    // Update all unread notifications
    await Notifikasi.update(
      {
        dibaca: true,
      },
      {
        where: {
          user_id,
          dibaca: false,
        },
        transaction: t,
      }
    );

    await t.commit();

    return res.success("All notifications marked as read");
  } catch (error) {
    await t.rollback();
    console.error("Mark all notifications as read error:", error);
    return res.error("Error marking all notifications as read", error);
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const user_id = req.user.user_id;

    const notification = await Notifikasi.findOne({
      where: {
        notifikasi_id: id,
        user_id,
      },
    });

    if (!notification) {
      await t.rollback();
      return res.error("Notification not found", null, 404);
    }

    // Delete notification
    await notification.destroy({ transaction: t });

    await t.commit();

    return res.success("Notification deleted successfully");
  } catch (error) {
    await t.rollback();
    console.error("Delete notification error:", error);
    return res.error("Error deleting notification", error);
  }
};

// Create notification (internal use)
exports.createNotification = async (
  user_id,
  judul,
  pesan,
  transaction = null
) => {
  try {
    const notification = await Notifikasi.create(
      {
        user_id,
        judul,
        pesan,
        dibaca: false,
      },
      transaction ? { transaction } : {}
    );

    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    throw error;
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const count = await Notifikasi.count({
      where: {
        user_id,
        dibaca: false,
      },
    });

    return res.success("Unread notification count retrieved", { count });
  } catch (error) {
    console.error("Get unread notification count error:", error);
    return res.error("Error getting unread notification count", error);
  }
};
