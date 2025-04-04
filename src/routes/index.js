const express = require("express");
const router = express.Router();

// Import route modules
const exampleRoutes = require("./example");

// Default route
router.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Welcome to the API",
    data: {
      version: "1.0.0",
    },
  });
});

// Register routes
router.use("/examples", exampleRoutes);

module.exports = router;
