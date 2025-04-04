const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Rating = sequelize.define(
    "Rating",
    {
      rating_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      transaksi_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "transaksi",
          key: "transaksi_id",
        },
      },
      reviewer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
      },
      reviewed_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
      },
      nilai: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      komentar: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      tanggal: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "rating",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  // Association methods
  Rating.associate = function (models) {
    Rating.belongsTo(models.Transaksi, {
      as: "transaksi",
      foreignKey: "transaksi_id",
    });

    Rating.belongsTo(models.User, {
      as: "reviewer",
      foreignKey: "reviewer_id",
    });

    Rating.belongsTo(models.User, {
      as: "reviewed",
      foreignKey: "reviewed_id",
    });
  };

  return Rating;
};
