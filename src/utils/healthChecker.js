/**
 * Health checker utility
 * Provides functions to check the health of various components
 */
const { sequelize } = require("../config/database");
const { version } = require("../../package.json");
const os = require("os");

/**
 * Check database connection
 * @returns {Promise<Object>} - Database status information
 */
const checkDatabase = async () => {
  try {
    // Try to run a simple query to check connection
    await sequelize.query("SELECT 1+1 as result");
    return {
      status: "connected",
      message: "Database connection is established",
    };
  } catch (error) {
    console.error("Database health check failed:", error);
    return {
      status: "disconnected",
      message: error.message,
    };
  }
};

/**
 * Get system information
 * @returns {Object} - System information
 */
const getSystemInfo = () => {
  return {
    status: "running",
    uptime: formatUptime(process.uptime()),
    environment: process.env.NODE_ENV,
    memory: {
      total: `${Math.round(os.totalmem() / (1024 * 1024))} MB`,
      free: `${Math.round(os.freemem() / (1024 * 1024))} MB`,
      usage: `${Math.round(
        ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
      )}%`,
    },
    cpu: os.cpus().length,
    version: version,
  };
};

/**
 * Format uptime into a readable string
 * @param {number} seconds - Uptime in seconds
 * @returns {string} - Formatted uptime
 */
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / (3600 * 24));
  seconds %= 3600 * 24;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
};

/**
 * Check overall system health
 * @returns {Promise<Object>} - Complete health status
 */
const checkHealth = async () => {
  const dbStatus = await checkDatabase();
  const systemInfo = getSystemInfo();

  const isHealthy = dbStatus.status === "connected";

  return {
    status: isHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    database: dbStatus,
    server: systemInfo,
  };
};

module.exports = {
  checkHealth,
  checkDatabase,
  getSystemInfo,
};
