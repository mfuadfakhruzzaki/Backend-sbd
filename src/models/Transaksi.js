const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Transaksi = sequelize.define(
    "Transaksi",
    {
      transaksi_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      barang_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "barang",
          key: "barang_id",
        },
      },
      seller_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
      },
      buyer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
      },
      tanggal_transaksi: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      metode_pembayaran: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      total_harga: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "dibayar",
          "diproses",
          "dikirim",
          "selesai",
          "dibatalkan"
        ),
        defaultValue: "pending",
      },
      catatan: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "transaksi",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  // Association methods
  Transaksi.associate = function (models) {
    Transaksi.belongsTo(models.User, {
      as: "pembeli",
      foreignKey: "buyer_id",
    });

    Transaksi.belongsTo(models.User, {
      as: "penjual",
      foreignKey: "seller_id",
    });

    Transaksi.belongsTo(models.Barang, {
      as: "barang",
      foreignKey: "barang_id",
    });

    Transaksi.hasOne(models.Rating, {
      as: "rating",
      foreignKey: "transaksi_id",
    });
  };

  return Transaksi;
};
