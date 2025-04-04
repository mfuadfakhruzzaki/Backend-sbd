const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const { sequelize, testConnection } = require("./config/database");
const db = require("./models");
const responseHandler = require("./middlewares/responseHandler");
const seedDatabase = require("./seeders/initialData");
const fs = require("fs");
const { checkHealth } = require("./utils/healthChecker");

// Load environment variables
dotenv.config();

// Max retry attempts for database connection
const MAX_DB_CONNECTION_RETRIES = 5;
const DB_RETRY_INTERVAL = 5000; // 5 seconds

// Initialize express app
const app = express();
const PORT = process.env.PORT || 8080;

// Set up periodic health check (every 15 minutes)
const HEALTH_CHECK_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds

// Function to run a health check and log the results
const runPeriodicHealthCheck = async () => {
  try {
    const healthStatus = await checkHealth();

    if (healthStatus.status === "unhealthy") {
      console.error(
        `[${new Date().toISOString()}] HEALTH CHECK FAILED:`,
        healthStatus
      );
    } else {
      console.log(`[${new Date().toISOString()}] Health check passed`);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] HEALTH CHECK ERROR:`, error);
  }
};

// Schedule the periodic health check if not in test environment
if (process.env.NODE_ENV !== "test") {
  // Initial health check on startup
  runPeriodicHealthCheck();

  // Set up interval for regular health checks
  setInterval(runPeriodicHealthCheck, HEALTH_CHECK_INTERVAL);
}

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply response handler middleware
app.use(responseHandler);

// Import routes
const indexRouter = require("./routes/index");

// API version configuration
const API_VERSIONS = {
  v1: {
    active: true,
    routes: indexRouter,
  },
  // Future versions can be added here
  // v2: {
  //   active: true,
  //   routes: require("./routes/v2/index")
  // }
};

// Root API endpoint
app.get("/api", (req, res) => {
  const activeVersions = Object.keys(API_VERSIONS).filter(
    (version) => API_VERSIONS[version].active
  );

  res.success("E-Commerce Barang Bekas Mahasiswa API", {
    versions: activeVersions,
    latest: activeVersions[activeVersions.length - 1],
    documentation: "/api/docs",
  });
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const healthStatus = await checkHealth();

    if (healthStatus.status === "unhealthy") {
      // Tambahkan informasi konfigurasi database pada respons
      healthStatus.database.config = {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        database: process.env.DB_NAME || "ecommerce_mahasiswa",
        port: process.env.DB_PORT || 3306,
      };

      return res.error("System health check failed", healthStatus, 503);
    }

    return res.success("System is healthy", healthStatus);
  } catch (error) {
    console.error("Health check failed:", error);
    return res.error(
      "System health check failed",
      {
        status: "error",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      503
    );
  }
});

// Register versioned routes
Object.keys(API_VERSIONS).forEach((version) => {
  const versionConfig = API_VERSIONS[version];
  if (versionConfig.active) {
    app.use(`/api/${version}`, versionConfig.routes);
  }
});

// Legacy support - direct to the latest active version
// This ensures backward compatibility
const latestVersion = Object.keys(API_VERSIONS)
  .filter((version) => API_VERSIONS[version].active)
  .pop();

if (latestVersion) {
  app.use("/api", API_VERSIONS[latestVersion].routes);
}

// 404 handler
app.use((req, res, next) => {
  res.error("Not Found", null, 404);
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Determine if the error is a validation error or other known type
  const statusCode = err.status || 500;
  const errorDetail =
    process.env.NODE_ENV === "production" ? null : { stack: err.stack };

  res.error(err.message || "Internal Server Error", errorDetail, statusCode);
});

// Flag file to track if seeding has been performed
const SEED_FLAG_FILE = path.join(__dirname, ".seed_data", ".seed_complete");

// Check if database has been seeded before
const hasBeenSeeded = () => {
  try {
    // Ensure directory exists
    const seedDataDir = path.join(__dirname, ".seed_data");
    if (!fs.existsSync(seedDataDir)) {
      fs.mkdirSync(seedDataDir, { recursive: true });
    }
    return fs.existsSync(SEED_FLAG_FILE);
  } catch (error) {
    console.error("Error checking seed status:", error);
    return false;
  }
};

// Mark database as seeded
const markAsSeeded = () => {
  try {
    fs.writeFileSync(SEED_FLAG_FILE, new Date().toISOString());
    console.log("Database has been marked as seeded");
  } catch (error) {
    console.error("Error marking database as seeded:", error);
  }
};

// Database connection with retry mechanism
const connectWithRetry = async (
  retries = MAX_DB_CONNECTION_RETRIES,
  interval = DB_RETRY_INTERVAL
) => {
  let lastError = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Database connection attempt ${attempt}/${retries}`);

      // Use the query method instead of authenticate
      await sequelize.query("SELECT 1+1 as result");
      console.log("Database connection has been established successfully.");

      // Connection successful, proceed with database operations
      await syncAndSeedDatabase();
      return true;
    } catch (error) {
      lastError = error;
      console.error(
        `Database connection attempt ${attempt} failed:`,
        error.message
      );

      if (attempt < retries) {
        console.log(`Retrying in ${interval / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }
  }

  // All connection attempts failed
  console.error(
    `Failed to connect to database after ${retries} attempts. Last error:`,
    lastError
  );
  return false;
};

// Database synchronization and seeding
const syncAndSeedDatabase = async () => {
  try {
    // Sync database models in development mode
    if (process.env.NODE_ENV === "development") {
      await db.sequelize.sync({ alter: true });
      console.log("Database models synchronized successfully.");
    }

    // Run seeder if it hasn't been run before
    if (!hasBeenSeeded()) {
      console.log("Running initial database seeding...");
      const success = await seedDatabase();
      if (success) {
        markAsSeeded();
        console.log("Initial seeding completed successfully.");
      } else {
        console.error(
          "Initial seeding failed. Please check the logs for details."
        );
      }
    } else {
      console.log("Database has already been seeded. Skipping seeding.");
    }
  } catch (error) {
    console.error("Error during database synchronization/seeding:", error);
    throw error;
  }
};

// Start HTTP server
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at: http://localhost:${PORT}/api`);

    // Log each active version
    Object.keys(API_VERSIONS).forEach((version) => {
      if (API_VERSIONS[version].active) {
        console.log(
          `API ${version} available at: http://localhost:${PORT}/api/${version}`
        );
      }
    });

    console.log(
      `Health check available at: http://localhost:${PORT}/api/health`
    );
  });
};

// Main application startup function
const startApplication = async () => {
  try {
    // Try to connect to the database with retry
    const isConnected = await connectWithRetry();

    if (!isConnected) {
      console.warn(
        "WARNING: Starting server without successful database connection"
      );
      console.warn("Some features requiring database access may not work");
    }

    // Start the HTTP server
    startServer();
  } catch (error) {
    console.error("Fatal error during application startup:", error);
    process.exit(1);
  }
};

// Start the application
startApplication();

// Export app for testing
module.exports = app;
