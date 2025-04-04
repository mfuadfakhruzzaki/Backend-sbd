// Authentication middleware placeholder
// This would be replaced with actual auth logic

const jwt = require("jsonwebtoken");
const { User } = require("../models");

const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.error("Unauthorized: No token provided", null, 401);
    }

    // Verify token
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id
    const user = await User.findByPk(decoded.id);

    if (!user || user.status_akun !== "aktif") {
      return res.error(
        "Unauthorized: User does not exist or account is blocked",
        null,
        401
      );
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.error("Unauthorized: Invalid token", error, 401);
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.error("Forbidden: Admin access required", null, 403);
  }
};

// Use a single export pattern
module.exports = {
  authenticate,
  authorizeAdmin,
};
