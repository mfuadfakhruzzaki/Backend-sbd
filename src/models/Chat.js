const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Chat = sequelize.define(
    "Chat",
    {
      chat_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
      },
      receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
      },
      barang_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "barang",
          key: "barang_id",
        },
      },
      pesan: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status_dibaca: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      tanggal: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "chat",
      timestamps: false,
    }
  );

  // Association methods
  Chat.associate = function (models) {
    Chat.belongsTo(models.User, {
      as: "sender",
      foreignKey: "sender_id",
    });

    Chat.belongsTo(models.User, {
      as: "receiver",
      foreignKey: "receiver_id",
    });

    Chat.belongsTo(models.Barang, {
      as: "barang",
      foreignKey: "barang_id",
    });
  };

  return Chat;
};
