// Example controller with common CRUD operations

/**
 * Get all items
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllItems = (req, res) => {
  res.json({
    status: "success",
    message: "Items retrieved successfully",
    data: [], // This would come from a database
  });
};

/**
 * Get a single item by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getItemById = (req, res) => {
  const { id } = req.params;

  res.json({
    status: "success",
    message: "Item retrieved successfully",
    data: { id }, // This would come from a database
  });
};

/**
 * Create a new item
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createItem = (req, res) => {
  const itemData = req.body;

  res.status(201).json({
    status: "success",
    message: "Item created successfully",
    data: itemData, // This would include the saved item from database
  });
};

/**
 * Update an existing item
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateItem = (req, res) => {
  const { id } = req.params;
  const itemData = req.body;

  res.json({
    status: "success",
    message: "Item updated successfully",
    data: { id, ...itemData }, // This would be the updated item from database
  });
};

/**
 * Delete an item
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteItem = (req, res) => {
  const { id } = req.params;

  res.json({
    status: "success",
    message: "Item deleted successfully",
    data: { id }, // Typically just confirmation of deletion
  });
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};
