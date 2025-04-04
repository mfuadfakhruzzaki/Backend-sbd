/**
 * Response handler middleware
 * Standardizes API responses across the application
 */

// Extend Express's Response object
const responseHandler = (req, res, next) => {
  // Success response method
  res.success = function (
    message = "Success",
    data = null,
    meta = null,
    statusCode = 200
  ) {
    const response = {
      status: "success",
      message,
      data,
    };

    // Add meta information if provided
    if (meta) {
      response.meta = meta;
    }

    return this.status(statusCode).json(response);
  };

  // Error response method
  res.error = function (message = "Error", errors = null, statusCode = 400) {
    const response = {
      status: "error",
      message,
    };

    // Add detailed errors if provided
    if (errors) {
      response.errors =
        errors instanceof Error ? { message: errors.message } : errors;
    }

    return this.status(statusCode).json(response);
  };

  // Pagination helper
  res.paginate = function (total, page = 1, limit = 10) {
    // Convert to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Calculate total pages
    const totalPages = Math.ceil(total / limitNum);

    return {
      pagination: {
        total_items: total,
        total_pages: totalPages,
        current_page: pageNum,
        items_per_page: limitNum,
        has_next_page: pageNum < totalPages,
        has_prev_page: pageNum > 1,
      },
    };
  };

  next();
};

module.exports = responseHandler;
