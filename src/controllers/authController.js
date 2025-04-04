const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register a new user
exports.register = async (req, res) => {
  try {
    const { nama, email, password, kampus } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.error("Email already in use", null, 400);
    }

    // Create new user
    const user = await User.create({
      nama,
      email,
      password, // Hashed by User model hook
      kampus,
    });

    // Generate JWT token
    const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    // Return user data (without password)
    const userResponse = { ...user.get() };
    delete userResponse.password;

    return res.success(
      "User registered successfully",
      {
        user: userResponse,
        token,
      },
      null,
      201
    );
  } catch (error) {
    console.error("Registration error:", error);
    return res.error("Registration failed", error);
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.error("Invalid email or password", null, 401);
    }

    // Check if account is active
    if (user.status_akun !== "aktif") {
      return res.error("Your account has been blocked", null, 403);
    }

    // Check password
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return res.error("Invalid email or password", null, 401);
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    // Return user data (without password)
    const userResponse = { ...user.get() };
    delete userResponse.password;

    return res.success("Login successful", {
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.error("Login failed", error);
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user.user_id;

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.error("User not found", null, 404);
    }

    // Check current password
    const isPasswordValid = await user.checkPassword(current_password);
    if (!isPasswordValid) {
      return res.error("Current password is incorrect", null, 400);
    }

    // Update password
    await user.update({ password: new_password });

    return res.success("Password changed successfully");
  } catch (error) {
    console.error("Change password error:", error);
    return res.error("Error changing password", error);
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    // User is already attached to req in auth middleware
    const user = req.user;

    // Remove password from response
    const userResponse = { ...user.get() };
    delete userResponse.password;

    return res.success("User retrieved successfully", userResponse);
  } catch (error) {
    console.error("Get user error:", error);
    return res.error("Error getting user", error);
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { nama, nomor_telepon, alamat, kampus } = req.body;
    const userId = req.user.user_id;

    // Update user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.error("User not found", null, 404);
    }

    // Update fields
    await user.update({
      nama: nama || user.nama,
      nomor_telepon: nomor_telepon || user.nomor_telepon,
      alamat: alamat || user.alamat,
      kampus: kampus || user.kampus,
    });

    // Remove password from response
    const userResponse = { ...user.get() };
    delete userResponse.password;

    return res.success("Profile updated successfully", userResponse);
  } catch (error) {
    console.error("Update profile error:", error);
    return res.error("Error updating profile", error);
  }
};

// Update profile picture
exports.updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Check if file was uploaded
    if (!req.appwriteFiles || req.appwriteFiles.length === 0) {
      return res.error("No profile picture uploaded", null, 400);
    }

    // Get the profile picture URL
    const profilePictureUrl = req.appwriteFiles[0].url;

    // Update user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.error("User not found", null, 404);
    }

    // Update profile picture
    await user.update({
      profile_picture: profilePictureUrl,
    });

    // Remove password from response
    const userResponse = { ...user.get() };
    delete userResponse.password;

    return res.success("Profile picture updated successfully", userResponse);
  } catch (error) {
    console.error("Update profile picture error:", error);
    return res.error("Error updating profile picture", error);
  }
};
