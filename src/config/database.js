const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

// Load environment variables from .env file if not in production
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Connection pool configuration
const poolConfig = {
  max: 5, // Maximum number of connection in pool
  min: 0, // Minimum number of connection in pool
  acquire: 30000, // Maximum time, in milliseconds, that pool will try to get connection before throwing error
  idle: 10000, // Maximum time, in milliseconds, that a connection can be idle before being released
  evict: 1000 * 60 * 5, // Interval at which to check for idle connections for eviction
};

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ecommerce_mahasiswa",
};

// For logging connections in development only
const logging = process.env.NODE_ENV === "production" ? false : console.log;

// Initialize Sequelize with connection pool
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: "mysql",
    logging,
    pool: poolConfig,
    retry: {
      max: 5, // Maximum amount of connection retries
      match: [
        // Only retry specific errors
        /ETIMEDOUT/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
      ],
    },
    dialectOptions:
      process.env.NODE_ENV === "production"
        ? {
            // Production dialect options for better performance
            connectTimeout: 60000, // Increase connection timeout
            ssl: {
              rejectUnauthorized: false, // Only if using SSL with self-signed cert
            },
          }
        : {},
  }
);

// Helper function to log connection details safely (no passwords)
const getConnectionInfo = () => {
  return {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
    dialect: "mysql",
    environment: process.env.NODE_ENV || "development",
  };
};

// Test and authenticate the connection
const testConnection = async () => {
  const connectionInfo = getConnectionInfo();
  console.log("Database Configuration:", connectionInfo);

  try {
    // Use native sequelize authenticate method
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
    return true;
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
    console.error("Connection details:", connectionInfo);
    return false;
  }
};

// Explicitly add authenticate method if needed by other modules
sequelize.authenticate = async () => {
  try {
    // Create a test connection and query to test it
    const result = await sequelize.query("SELECT 1+1 as result");
    return result;
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
};

// Setup connections and return Sequelize instance
module.exports = {
  sequelize,
  testConnection,
  getConnectionInfo,
};
