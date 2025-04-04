const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Kategori = sequelize.define(
    "Kategori",
    {
      kategori_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nama_kategori: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      deskripsi: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      icon: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "kategori",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  // Association methods
  Kategori.associate = function (models) {
    Kategori.hasMany(models.Barang, {
      as: "barang",
      foreignKey: "kategori_id",
    });
  };

  return Kategori;
};
