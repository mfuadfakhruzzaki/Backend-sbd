const { Chat, User, Barang, sequelize, Notifikasi } = require("../models");
const { Op } = require("sequelize");

// Send a message
exports.sendMessage = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { receiver_id, barang_id, pesan } = req.body;
    const sender_id = req.user.user_id;

    // Validate receiver exists
    const receiver = await User.findByPk(receiver_id);
    if (!receiver) {
      await t.rollback();
      return res.error("Receiver not found", null, 404);
    }

    // If barang_id is provided, validate item exists
    if (barang_id) {
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
    }

    // Create message
    const chat = await Chat.create(
      {
        pengirim_id: sender_id,
        penerima_id: receiver_id,
        barang_id: barang_id || null,
        pesan,
        status_dibaca: false,
      },
      { transaction: t }
    );

    // Create notification for the receiver
    await Notifikasi.create(
      {
        user_id: receiver_id,
        judul: "New Message",
        pesan: `You have received a new message from ${req.user.nama}`,
        dibaca: false,
      },
      { transaction: t }
    );

    await t.commit();

    return res.success("Message sent successfully", chat, null, 201);
  } catch (error) {
    await t.rollback();
    console.error("Send message error:", error);
    return res.error("Error sending message", error);
  }
};

// Get conversation with a user
exports.getConversation = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { barang_id, page = 1, limit = 20 } = req.query;
    const current_user_id = req.user.user_id;
    const offset = (page - 1) * limit;

    const whereClause = {
      [Op.or]: [
        {
          pengirim_id: current_user_id,
          penerima_id: user_id,
        },
        {
          pengirim_id: user_id,
          penerima_id: current_user_id,
        },
      ],
    };

    // If barang_id is provided, filter messages by item
    if (barang_id) {
      whereClause.barang_id = barang_id;
    }

    const { count, rows: messages } = await Chat.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "pengirim",
          attributes: ["user_id", "nama", "profile_picture"],
        },
        {
          model: User,
          as: "penerima",
          attributes: ["user_id", "nama", "profile_picture"],
        },
        {
          model: Barang,
          as: "barang",
          attributes: ["barang_id", "judul", "foto", "harga"],
          required: false,
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["tanggal", "DESC"]],
    });

    // Mark unread messages as read
    await Chat.update(
      { status_dibaca: true },
      {
        where: {
          pengirim_id: user_id,
          penerima_id: current_user_id,
          status_dibaca: false,
        },
      }
    );

    return res.success(
      "Conversation retrieved successfully",
      messages,
      res.paginate(count, page, limit)
    );
  } catch (error) {
    console.error("Get conversation error:", error);
    return res.error("Error fetching conversation", error);
  }
};

// Get chat conversations list
exports.getConversationsList = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get the latest message from each conversation
    const query = `
      SELECT c.*, 
        u1.nama as pengirim_nama, u1.profile_picture as pengirim_foto,
        u2.nama as penerima_nama, u2.profile_picture as penerima_foto,
        b.judul as barang_judul, b.foto as barang_foto
      FROM (
        SELECT DISTINCT
          CASE 
            WHEN pengirim_id = :user_id THEN penerima_id
            ELSE pengirim_id
          END as other_user_id,
          MAX(chat_id) as latest_message_id
        FROM chat
        WHERE pengirim_id = :user_id OR penerima_id = :user_id
        GROUP BY other_user_id
      ) as latest_messages
      JOIN chat c ON c.chat_id = latest_messages.latest_message_id
      LEFT JOIN users u1 ON u1.user_id = c.pengirim_id
      LEFT JOIN users u2 ON u2.user_id = c.penerima_id
      LEFT JOIN barang b ON b.barang_id = c.barang_id
      ORDER BY c.tanggal DESC
      LIMIT :limit OFFSET :offset
    `;

    const conversations = await sequelize.query(query, {
      replacements: {
        user_id,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
      type: sequelize.QueryTypes.SELECT,
    });

    // Count total conversations
    const countQuery = `
      SELECT COUNT(DISTINCT 
        CASE 
          WHEN pengirim_id = :user_id THEN penerima_id
          ELSE pengirim_id
        END
      ) as total
      FROM chat
      WHERE pengirim_id = :user_id OR penerima_id = :user_id
    `;

    const [{ total }] = await sequelize.query(countQuery, {
      replacements: { user_id },
      type: sequelize.QueryTypes.SELECT,
    });

    // Format conversations
    const formattedConversations = conversations.map((c) => {
      const otherUser =
        c.pengirim_id == user_id
          ? {
              user_id: c.penerima_id,
              nama: c.penerima_nama,
              profile_picture: c.penerima_foto,
            }
          : {
              user_id: c.pengirim_id,
              nama: c.pengirim_nama,
              profile_picture: c.pengirim_foto,
            };

      return {
        chat_id: c.chat_id,
        last_message: c.pesan,
        last_message_time: c.tanggal,
        unread: c.pengirim_id != user_id && !c.status_dibaca,
        other_user: otherUser,
        barang: c.barang_id
          ? {
              barang_id: c.barang_id,
              judul: c.barang_judul,
              foto: c.barang_foto,
            }
          : null,
      };
    });

    return res.success(
      "Conversations list retrieved successfully",
      formattedConversations,
      res.paginate(parseInt(total), page, limit)
    );
  } catch (error) {
    console.error("Get conversations list error:", error);
    return res.error("Error fetching conversations list", error);
  }
};

// Get unread messages count
exports.getUnreadCount = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const count = await Chat.count({
      where: {
        penerima_id: user_id,
        status_dibaca: false,
      },
    });

    return res.success("Unread messages count retrieved", { count });
  } catch (error) {
    console.error("Get unread count error:", error);
    return res.error("Error getting unread messages count", error);
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const user_id = req.user.user_id;

    const message = await Chat.findOne({
      where: {
        chat_id: id,
        pengirim_id: user_id,
      },
    });

    if (!message) {
      await t.rollback();
      return res.error("Message not found or not authorized", null, 404);
    }

    // Delete message
    await message.destroy({ transaction: t });

    await t.commit();

    return res.success("Message deleted successfully");
  } catch (error) {
    await t.rollback();
    console.error("Delete message error:", error);
    return res.error("Error deleting message", error);
  }
};
