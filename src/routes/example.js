const express = require("express");
const router = express.Router();
const {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} = require("../controllers/exampleController");

// Get all items
router.get("/", getAllItems);

// Get a single item by ID
router.get("/:id", getItemById);

// Create a new item
router.post("/", createItem);

// Update an item
router.put("/:id", updateItem);

// Delete an item
router.delete("/:id", deleteItem);

module.exports = router;
