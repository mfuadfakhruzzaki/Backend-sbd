const db = require("../models");
const bcrypt = require("bcryptjs");
const { sequelize } = require("../config/database");

const seedDatabase = async () => {
  try {
    // Ensure we have models referenced correctly
    const { User, Kategori } = db;

    // Connect to database
    await sequelize.query("SELECT 1+1 as result");
    console.log("Database connection has been established successfully.");

    // Synchronize models
    await db.sequelize.sync({ alter: true });
    console.log("Database synchronized successfully.");

    // Check if admin user exists
    const adminExists = await User.findOne({
      where: {
        email: "admin@fuadfakhruz.id",
      },
    });

    // Create admin user if it doesn't exist
    if (!adminExists) {
      // Cara yang benar: menggunakan password mentah, biarkan model hooks melakukan hashing
      await User.create({
        nama: "Admin",
        email: "admin@fuadfakhruz.id",
        password: "Herazaki0201", // Password mentah, bukan hash
        role: "admin",
        status_akun: "aktif", // Pastikan status akun aktif
        alamat: "Admin Address",
      });
      console.log("Admin user created successfully.");
    }

    // Create sample kategoris if they don't exist
    const kategoris = [
      {
        nama_kategori: "Elektronik",
        deskripsi: "Barang elektronik seperti laptop, handphone, dll",
        icon: "fas fa-laptop",
      },
      {
        nama_kategori: "Pakaian",
        deskripsi: "Pakaian, jaket, sepatu, dll",
        icon: "fas fa-tshirt",
      },
      {
        nama_kategori: "Buku",
        deskripsi: "Buku kuliah, novel, komik, dll",
        icon: "fas fa-book",
      },
      {
        nama_kategori: "Furnitur",
        deskripsi: "Meja, kursi, rak, dll",
        icon: "fas fa-chair",
      },
      {
        nama_kategori: "Kendaraan",
        deskripsi: "Sepeda, motor, dll",
        icon: "fas fa-bicycle",
      },
      {
        nama_kategori: "Aksesoris",
        deskripsi: "Jam tangan, tas, dll",
        icon: "fas fa-gem",
      },
      {
        nama_kategori: "Alat Musik",
        deskripsi: "Gitar, piano, biola, dll",
        icon: "fas fa-guitar",
      },
      {
        nama_kategori: "Olahraga",
        deskripsi: "Peralatan olahraga, sepatu sport, dll",
        icon: "fas fa-basketball-ball",
      },
      {
        nama_kategori: "Gaming",
        deskripsi: "Konsol game, aksesoris gaming, dll",
        icon: "fas fa-gamepad",
      },
      {
        nama_kategori: "Perabotan Rumah",
        deskripsi: "Perlengkapan dapur, kamar, dll",
        icon: "fas fa-home",
      },
      {
        nama_kategori: "Seni & Kerajinan",
        deskripsi: "Lukisan, kerajinan tangan, dll",
        icon: "fas fa-paint-brush",
      },
      {
        nama_kategori: "Koleksi",
        deskripsi: "Action figure, kartu koleksi, dll",
        icon: "fas fa-trophy",
      },
      {
        nama_kategori: "Lainnya",
        deskripsi:
          "Barang-barang lain yang tidak termasuk dalam kategori di atas",
        icon: "fas fa-box",
      },
    ];

    for (const kategori of kategoris) {
      const exists = await Kategori.findOne({
        where: {
          nama_kategori: kategori.nama_kategori,
        },
      });

      if (!exists) {
        await Kategori.create(kategori);
        console.log(`Kategori ${kategori.nama_kategori} created successfully.`);
      }
    }

    console.log("Database seeding completed successfully.");
    return true; // Return true to indicate seeding was successfully completed
  } catch (error) {
    console.error("Error seeding database:", error);
    return false; // Return false to indicate seeding failed
  }
};

// Export the seeder function
module.exports = seedDatabase;

// Run seeder if called directly
if (require.main === module) {
  seedDatabase().then((success) => {
    process.exit(success ? 0 : 1);
  });
}
