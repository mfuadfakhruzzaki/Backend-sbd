const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Wishlist = sequelize.define(
    "Wishlist",
    {
      wishlist_id: {
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
      barang_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "barang",
          key: "barang_id",
        },
      },
      tanggal_tambah: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "wishlist",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  // Association methods
  Wishlist.associate = function (models) {
    Wishlist.belongsTo(models.User, {
      as: "user",
      foreignKey: "user_id",
    });

    Wishlist.belongsTo(models.Barang, {
      as: "barang",
      foreignKey: "barang_id",
    });
  };

  return Wishlist;
};
