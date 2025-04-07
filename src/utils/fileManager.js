const { storage } = require("../config/appwrite");

/**
 * Ekstrak file ID dari Appwrite view URL
 * @param {string} url - Appwrite file view URL
 * @returns {string|null} - File ID atau null jika tidak ditemukan
 */
const getFileIdFromUrl = (url) => {
  try {
    // Format URL: endpoint/storage/buckets/BUCKET_ID/files/FILE_ID/view?project=PROJECT_ID&mode=admin
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");

    // Cari indeks 'files' di path URL
    const filesIndex = pathParts.findIndex((part) => part === "files");
    if (filesIndex > -1 && pathParts.length > filesIndex + 1) {
      // File ID berada setelah 'files' di path
      return pathParts[filesIndex + 1];
    }
    return null;
  } catch (error) {
    console.error("Error ekstrak file ID dari URL:", error);
    return null;
  }
};

/**
 * Hapus file dari Appwrite storage menggunakan URL-nya
 * @param {string} url - Appwrite file view URL
 * @returns {Promise<boolean>} - Status keberhasilan
 */
const deleteFileByUrl = async (url) => {
  try {
    const fileId = getFileIdFromUrl(url);
    if (!fileId) {
      console.error("Tidak bisa ekstrak file ID dari URL:", url);
      return false;
    }

    // Dapatkan bucket ID dari URL
    const parts = url.split("/");
    const bucketsIndex = parts.findIndex((part) => part === "buckets");
    if (bucketsIndex === -1 || parts.length <= bucketsIndex + 1) {
      console.error("Tidak bisa ekstrak bucket ID dari URL:", url);
      return false;
    }

    const bucketId = parts[bucketsIndex + 1];

    // Hapus file dari Appwrite
    await storage.deleteFile(bucketId, fileId);
    console.log(`File berhasil dihapus dari Appwrite: ${fileId}`);
    return true;
  } catch (error) {
    console.error("Error menghapus file dari Appwrite:", error);
    return false;
  }
};

/**
 * Hapus multiple file dari Appwrite storage
 * @param {string[]} urls - Array Appwrite file view URL
 * @returns {Promise<{success: number, failed: number}>} - Jumlah penghapusan yang berhasil dan gagal
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
