const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nama: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      alamat: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      no_telepon: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      profile_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM("user", "admin"),
        defaultValue: "user",
      },
      status_akun: {
        type: DataTypes.ENUM("aktif", "nonaktif", "diblokir"),
        defaultValue: "aktif",
      },
    },
    {
      timestamps: true,
      tableName: "users",
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );

  // Instance methods
  User.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  // Association methods
  User.associate = function (models) {
    User.hasMany(models.Barang, {
      as: "barang",
      foreignKey: "user_id",
    });
    User.hasMany(models.Transaksi, {
      as: "transaksi_pembeli",
      foreignKey: "pembeli_id",
    });
    User.hasMany(models.Transaksi, {
      as: "transaksi_penjual",
      foreignKey: "penjual_id",
    });
    User.hasMany(models.Chat, {
      as: "chat_pengirim",
      foreignKey: "pengirim_id",
    });
    User.hasMany(models.Chat, {
      as: "chat_penerima",
      foreignKey: "penerima_id",
    });
    User.hasMany(models.Rating, {
      as: "ratings_diberikan",
      foreignKey: "pemberi_id",
    });
    User.hasMany(models.Rating, {
      as: "ratings_diterima",
      foreignKey: "penerima_id",
    });
    User.hasMany(models.Wishlist, {
      as: "wishlist",
      foreignKey: "user_id",
    });
    User.hasMany(models.Notifikasi, {
      as: "notifikasi",
      foreignKey: "user_id",
    });
    User.hasMany(models.Laporan, {
      as: "laporan_pelapor",
      foreignKey: "pelapor_id",
    });
    User.hasMany(models.Laporan, {
      as: "laporan_terlapor",
      foreignKey: "terlapor_id",
    });
  };

  return User;
};
