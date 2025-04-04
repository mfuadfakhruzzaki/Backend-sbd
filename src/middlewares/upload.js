const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { storage, BUCKET_ID } = require("../config/appwrite");
const { ID } = require("node-appwrite");

// Setup multer for memory storage instead of disk storage
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".jpg", ".jpeg", ".png", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedTypes.includes(ext)) {
      return cb(new Error("Only image files are allowed"));
    }

    cb(null, true);
  },
});

// Middleware to handle file upload to Appwrite
const uploadToAppwrite = () => {
  return async (req, res, next) => {
    // Skip if no files were uploaded
    if (!req.files || req.files.length === 0) {
      return next();
    }

    try {
      // Array to store file info
      // We'll track both ID and URL internally, but only expose URL to the controller
      const internalFileData = [];
      req.appwriteFiles = [];

      // Process each file
      for (const file of req.files) {
        // Generate a unique file ID
        const fileId = ID.unique();

        // Create file name with timestamp to avoid duplicates
        const fileName = `${Date.now()}-${fileId}${path.extname(
          file.originalname
        )}`;

        // Upload file to Appwrite
        const result = await storage.createFile(
          BUCKET_ID,
          fileId,
          file.buffer,
          {
            filename: fileName,
            contentType: file.mimetype,
          }
        );

        // Get a view URL for the file
        const fileUrl = `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view`;

        // Store complete file data internally
        internalFileData.push({
          id: fileId,
          name: fileName,
          url: fileUrl,
        });

        // But only expose URL to the controller
        req.appwriteFiles.push({
          url: fileUrl,
        });
      }

      // Store complete file data for internal use (e.g., cleaning up files)
      req._appwriteFilesInternal = internalFileData;

      next();
    } catch (error) {
      console.error("Error uploading file to Appwrite:", error);
      return res.status(500).json({
        status: "error",
        message: "Error uploading file",
        error: error.message,
      });
    }
  };
};

// Export prepared middleware
module.exports = {
  upload: uploadMemory,
  uploadToAppwrite,
};
