const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Barang = sequelize.define(
    "Barang",
    {
      barang_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
      },
      kategori_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "kategori",
          key: "kategori_id",
        },
      },
      judul: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      deskripsi: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      foto: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      harga: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      lokasi: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      kondisi: {
        type: DataTypes.ENUM("baru", "seperti baru", "bekas", "rusak ringan"),
        allowNull: false,
      },
      views_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM("tersedia", "terjual", "dipesan"),
        defaultValue: "tersedia",
      },
      status_delete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "barang",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  // Association methods
  Barang.associate = function (models) {
    Barang.belongsTo(models.User, {
      as: "pemilik",
      foreignKey: "user_id",
    });

    Barang.belongsTo(models.Kategori, {
      as: "kategori",
      foreignKey: "kategori_id",
    });

    Barang.hasOne(models.Transaksi, {
      as: "transaksi",
      foreignKey: "barang_id",
    });

    Barang.hasMany(models.Chat, {
      as: "messages",
      foreignKey: "barang_id",
    });

    Barang.hasMany(models.Wishlist, {
      as: "wishlist_entries",
      foreignKey: "barang_id",
    });
  };

  return Barang;
};
