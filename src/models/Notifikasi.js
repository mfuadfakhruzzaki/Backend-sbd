const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Notifikasi = sequelize.define(
    "Notifikasi",
    {
      notifikasi_id: {
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
      judul: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      pesan: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      dibaca: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      tanggal: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "notifikasi",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  // Association methods
  Notifikasi.associate = function (models) {
    Notifikasi.belongsTo(models.User, {
      as: "user",
      foreignKey: "user_id",
    });
  };

  return Notifikasi;
};
