const { Barang, User, Kategori } = require("../models");
const { Op } = require("sequelize");
const path = require("path");
const { storage, BUCKET_ID } = require("../config/appwrite");
const fileManager = require("../utils/fileManager");

// Get all items with filtering
exports.getAllBarang = async (req, res) => {
  try {
    const {
      kategori_id,
      kondisi,
      min_harga,
      max_harga,
      kampus,
      lokasi,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    // Building filter conditions
    const whereConditions = {
      status_delete: false,
      status: "tersedia",
    };

    if (kategori_id) whereConditions.kategori_id = kategori_id;
    if (kondisi) whereConditions.kondisi = kondisi;
    if (min_harga)
      whereConditions.harga = { ...whereConditions.harga, [Op.gte]: min_harga };
    if (max_harga)
      whereConditions.harga = { ...whereConditions.harga, [Op.lte]: max_harga };
    if (lokasi) whereConditions.lokasi = { [Op.like]: `%${lokasi}%` };
    if (search) {
      whereConditions[Op.or] = [
        { judul: { [Op.like]: `%${search}%` } },
        { deskripsi: { [Op.like]: `%${search}%` } },
      ];
    }

    // User/campus filter
    const userInclude = {
      model: User,
      as: "pemilik",
      attributes: ["user_id", "nama", "email", "profile_image"],
    };

    if (kampus) {
      userInclude.where = {
        alamat: { [Op.like]: `%${kampus}%` },
      };
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Find items
    const { count, rows: barang } = await Barang.findAndCountAll({
      where: whereConditions,
      include: [
        userInclude,
        {
          model: Kategori,
          as: "kategori",
          attributes: ["kategori_id", "nama_kategori"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.success(
      "Items retrieved successfully",
      barang,
      res.paginate(count, page, limit)
    );
  } catch (error) {
    console.error("Get all items error:", error);
    return res.error("Error fetching items", error);
  }
};

// Get item by ID
exports.getBarangById = async (req, res) => {
  try {
    const { id } = req.params;

    const barang = await Barang.findOne({
      where: {
        barang_id: id,
        status_delete: false,
      },
      include: [
        {
          model: User,
          as: "pemilik",
          attributes: ["user_id", "nama", "email", "profile_image"],
        },
        {
          model: Kategori,
          as: "kategori",
          attributes: ["kategori_id", "nama_kategori"],
        },
      ],
    });

    if (!barang) {
      return res.error("Item not found", null, 404);
    }

    // Increment view count
    await barang.update({
      views_count: barang.views_count + 1,
    });

    return res.success("Item retrieved successfully", barang);
  } catch (error) {
    console.error("Get item error:", error);
    return res.error("Error fetching item", error);
  }
};

// Create a new item
exports.createBarang = async (req, res) => {
  try {
    const { judul, deskripsi, kategori_id, harga, lokasi, kondisi } = req.body;

    // Check required fields
    if (!judul || !deskripsi || !kategori_id || !harga || !kondisi) {
      return res.error("Please provide all required fields", null, 400);
    }

    // Get user ID from auth middleware
    const user_id = req.user.user_id;

    // Get file URLs from Appwrite upload middleware
    let foto = [];
    if (req.appwriteFiles && req.appwriteFiles.length > 0) {
      foto = req.appwriteFiles.map((file) => file.url);
      console.log("Foto URLs that will be saved:", foto);
    }

    // Create item
    const barang = await Barang.create({
      user_id,
      kategori_id,
      judul,
      deskripsi,
      foto,
      harga,
      lokasi,
      kondisi,
    });

    return res.success("Item created successfully", barang, null, 201);
  } catch (error) {
    console.error("Create item error:", error);
    return res.error("Error creating item", error);
  }
};

// Update an item
exports.updateBarang = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      judul,
      deskripsi,
      kategori_id,
      harga,
      lokasi,
      kondisi,
      status,
      deleted_image_urls,
    } = req.body;

    // Find the item
    const barang = await Barang.findByPk(id);

    if (!barang) {
      return res.error("Item not found", null, 404);
    }

    // Check ownership
    if (barang.user_id !== req.user.user_id && req.user.role !== "admin") {
      return res.error(
        "You do not have permission to update this item",
        null,
        403
      );
    }

    // Process existing photos
    let currentFotos = barang.foto || [];

    // Handle deleted photos if any specified in request
    if (deleted_image_urls && Array.isArray(deleted_image_urls)) {
      // Delete files from Appwrite
      await fileManager.deleteFilesByUrls(deleted_image_urls);

      // Remove the deleted URLs from current photos
      currentFotos = currentFotos.filter(
        (url) => !deleted_image_urls.includes(url)
      );
    }

    // Add new uploaded files
    if (req.appwriteFiles && req.appwriteFiles.length > 0) {
      const newFotoUrls = req.appwriteFiles.map((file) => file.url);
      currentFotos = [...currentFotos, ...newFotoUrls];
    }

    // Update item
    await barang.update({
      judul: judul || barang.judul,
      deskripsi: deskripsi || barang.deskripsi,
      kategori_id: kategori_id || barang.kategori_id,
      foto: currentFotos,
      harga: harga || barang.harga,
      lokasi: lokasi || barang.lokasi,
      kondisi: kondisi || barang.kondisi,
      status: status || barang.status,
    });

    return res.success("Item updated successfully", barang);
  } catch (error) {
    console.error("Update item error:", error);
    return res.error("Error updating item", error);
  }
};

// Soft delete an item
exports.softDeleteBarang = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the item
    const barang = await Barang.findByPk(id);

    if (!barang) {
      return res.error("Item not found", null, 404);
    }

    // Check ownership
    if (barang.user_id !== req.user.user_id && req.user.role !== "admin") {
      return res.error(
        "You do not have permission to delete this item",
        null,
        403
      );
    }

    // Soft delete
    await barang.update({
      status_delete: true,
      deleted_at: new Date(),
    });

    return res.success("Item deleted successfully");
  } catch (error) {
    console.error("Soft delete item error:", error);
    return res.error("Error deleting item", error);
  }
};

// Hard delete an item (admin only)
exports.hardDeleteBarang = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the item
    const barang = await Barang.findByPk(id);

    if (!barang) {
      return res.error("Item not found", null, 404);
    }

    // Delete photos from Appwrite
    if (barang.foto && Array.isArray(barang.foto)) {
      await fileManager.deleteFilesByUrls(barang.foto);
    }

    // Hard delete the item from database
    await barang.destroy({ force: true });

    return res.success("Item permanently deleted");
  } catch (error) {
    console.error("Hard delete item error:", error);
    return res.error("Error permanently deleting item", error);
  }
};

// Get user's own items
exports.getUserItems = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { status, page = 1, limit = 10 } = req.query;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build where condition
    const whereConditions = { user_id };

    if (status) {
      whereConditions.status = status;
    }

    // Find items
    const { count, rows: barang } = await Barang.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Kategori,
          as: "kategori",
          attributes: ["kategori_id", "nama_kategori"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.success(
      "User items retrieved successfully",
      barang,
      res.paginate(count, page, limit)
    );
  } catch (error) {
    console.error("Get user items error:", error);
    return res.error("Error fetching user items", error);
  }
};
