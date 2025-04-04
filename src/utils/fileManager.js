const { storage, BUCKET_ID } = require("../config/appwrite");

/**
 * Extracts file ID from Appwrite view URL
 * @param {string} url - Appwrite file view URL
 * @returns {string|null} - File ID or null if not found
 */
const getFileIdFromUrl = (url) => {
  try {
    // Typical URL format: endpoint/storage/buckets/BUCKET_ID/files/FILE_ID/view
    const parts = url.split("/");
    // Find the index of 'files' in the URL path
    const filesIndex = parts.findIndex((part) => part === "files");
    if (filesIndex > -1 && parts.length > filesIndex + 1) {
      return parts[filesIndex + 1];
    }
    return null;
  } catch (error) {
    console.error("Error extracting file ID from URL:", error);
    return null;
  }
};

/**
 * Deletes a file from Appwrite storage using its URL
 * @param {string} url - Appwrite file view URL
 * @returns {Promise<boolean>} - Success status
 */
const deleteFileByUrl = async (url) => {
  try {
    const fileId = getFileIdFromUrl(url);
    if (!fileId) {
      return false;
    }

    await storage.deleteFile(BUCKET_ID, fileId);
    return true;
  } catch (error) {
    console.error("Error deleting file from Appwrite:", error);
    return false;
  }
};

/**
 * Deletes multiple files from Appwrite storage
 * @param {string[]} urls - Array of Appwrite file view URLs
 * @returns {Promise<{success: number, failed: number}>} - Count of successful and failed deletions
 */
const deleteFilesByUrls = async (urls) => {
  const results = {
    success: 0,
    failed: 0,
  };

  if (!urls || !Array.isArray(urls)) {
    return results;
  }

  for (const url of urls) {
    const success = await deleteFileByUrl(url);
    if (success) {
      results.success++;
    } else {
      results.failed++;
    }
  }

  return results;
};

module.exports = {
  getFileIdFromUrl,
  deleteFileByUrl,
  deleteFilesByUrls,
};
