const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Laporan = sequelize.define(
    "Laporan",
    {
      laporan_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      reporter_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
      },
      reported_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
      },
      alasan: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "diproses", "ditolak", "diterima"),
        defaultValue: "pending",
      },
      tanggal_laporan: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "laporan",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  // Association methods
  Laporan.associate = function (models) {
    Laporan.belongsTo(models.User, {
      as: "reporter",
      foreignKey: "reporter_id",
    });

    Laporan.belongsTo(models.User, {
      as: "reported",
      foreignKey: "reported_id",
    });
  };

  return Laporan;
};
