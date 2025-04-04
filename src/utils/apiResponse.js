/**
 * Standardized API response utility functions
 */

/**
 * Generate a success response
 * @param {Object} options - Response options
 * @param {String} options.message - Success message
 * @param {Object|Array} options.data - Response data
 * @param {Object} options.meta - Additional metadata (pagination, etc)
 * @param {Number} options.statusCode - HTTP status code (default: 200)
 * @returns {Object} Standardized success response
 */
const success = ({
  message = "Success",
  data = null,
  meta = null,
  statusCode = 200,
}) => {
  const response = {
    status: "success",
    message,
    data,
  };

  // Add meta information if provided
  if (meta) {
    response.meta = meta;
  }

  return {
    body: response,
    statusCode,
  };
};

/**
 * Generate an error response
 * @param {Object} options - Response options
 * @param {String} options.message - Error message
 * @param {Object} options.errors - Detailed errors (validation, etc)
 * @param {Number} options.statusCode - HTTP status code (default: 400)
 * @returns {Object} Standardized error response
 */
const error = ({ message = "Error", errors = null, statusCode = 400 }) => {
  const response = {
    status: "error",
    message,
  };

  // Add detailed errors if provided
  if (errors) {
    response.errors = errors;
  }

  return {
    body: response,
    statusCode,
  };
};

/**
 * Generate pagination metadata
 * @param {Object} options - Pagination options
 * @param {Number} options.total - Total number of items
 * @param {Number} options.page - Current page (default: 1)
 * @param {Number} options.limit - Items per page (default: 10)
 * @returns {Object} Pagination metadata
 */
const pagination = ({ total, page = 1, limit = 10 }) => {
  // Convert to numbers
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  // Calculate total pages
  const totalPages = Math.ceil(total / limitNum);

  return {
    pagination: {
      total,
      per_page: limitNum,
      current_page: pageNum,
      total_pages: totalPages,
      has_next_page: pageNum < totalPages,
      has_prev_page: pageNum > 1,
    },
  };
};

module.exports = {
  success,
  error,
  pagination,
};
