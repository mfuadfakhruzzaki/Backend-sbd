const { Kategori } = require("../models");

// Get all categories
exports.getAllKategori = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Find categories with pagination
    const { count, rows: kategori } = await Kategori.findAndCountAll({
      order: [["nama_kategori", "ASC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.success(
      "Categories retrieved successfully",
      kategori,
      res.paginate(count, page, limit)
    );
  } catch (error) {
    console.error("Get categories error:", error);
    return res.error("Error fetching categories", error);
  }
};

// Get category by ID
exports.getKategoriById = async (req, res) => {
  try {
    const { id } = req.params;

    const kategori = await Kategori.findByPk(id);

    if (!kategori) {
      return res.error("Category not found", null, 404);
    }

    return res.success("Category retrieved successfully", kategori);
  } catch (error) {
    console.error("Get category error:", error);
    return res.error("Error fetching category", error);
  }
};

// Create a new category (admin only)
exports.createKategori = async (req, res) => {
  try {
    const { nama_kategori, deskripsi, icon } = req.body;

    // Check if category already exists
    const existingKategori = await Kategori.findOne({
      where: { nama_kategori },
    });

    if (existingKategori) {
      return res.error("Category already exists", null, 400);
    }

    const kategori = await Kategori.create({
      nama_kategori,
      deskripsi,
      icon,
    });

    return res.success("Category created successfully", kategori, null, 201);
  } catch (error) {
    console.error("Create category error:", error);
    return res.error("Error creating category", error);
  }
};

// Update a category (admin only)
exports.updateKategori = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_kategori, deskripsi, icon } = req.body;

    const kategori = await Kategori.findByPk(id);

    if (!kategori) {
      return res.error("Category not found", null, 404);
    }

    // Check if category name already exists
    if (nama_kategori && nama_kategori !== kategori.nama_kategori) {
      const existingKategori = await Kategori.findOne({
        where: { nama_kategori },
      });

      if (existingKategori) {
        return res.error("Category name already exists", null, 400);
      }
    }

    await kategori.update({
      nama_kategori: nama_kategori || kategori.nama_kategori,
      deskripsi: deskripsi !== undefined ? deskripsi : kategori.deskripsi,
      icon: icon || kategori.icon,
    });

    return res.success("Category updated successfully", kategori);
  } catch (error) {
    console.error("Update category error:", error);
    return res.error("Error updating category", error);
  }
};

// Delete a category (admin only)
exports.deleteKategori = async (req, res) => {
  try {
    const { id } = req.params;

    const kategori = await Kategori.findByPk(id);

    if (!kategori) {
      return res.error("Category not found", null, 404);
    }

    await kategori.destroy();

    return res.success("Category deleted successfully", null);
  } catch (error) {
    console.error("Delete category error:", error);
    return res.error("Error deleting category", error);
  }
};
