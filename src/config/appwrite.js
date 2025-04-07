const { Client, Storage } = require("node-appwrite");
const dotenv = require("dotenv");

dotenv.config();

// Konfigurasi Appwrite dari environment
const endpoint =
  process.env.APPWRITE_ENDPOINT ||
  "http://tugas-akhir-sbd-appwrite-baa3ca-34-50-95-184.traefik.me/v1";
const projectId = process.env.APPWRITE_PROJECT_ID || "67ec168f001774966f85";
const apiKey = process.env.APPWRITE_API_KEY || "your-api-key";
const bucketId = process.env.APPWRITE_BUCKET_ID || "67ec16ad001dd1f0a484";

// Validasi konfigurasi
const validateConfig = () => {
  const errors = [];

  if (!endpoint || endpoint === "your-endpoint") {
    errors.push("APPWRITE_ENDPOINT tidak valid atau tidak diatur");
  }

  if (!projectId || projectId === "your-project-id") {
    errors.push("APPWRITE_PROJECT_ID tidak valid atau tidak diatur");
  }

  if (!apiKey || apiKey === "your-api-key") {
    errors.push("APPWRITE_API_KEY tidak valid atau tidak diatur");
  }

  if (!bucketId || bucketId === "your-bucket-id") {
    errors.push("APPWRITE_BUCKET_ID tidak valid atau tidak diatur");
  }

  return errors;
};

const configErrors = validateConfig();
if (configErrors.length > 0) {
  console.error("KONFIGURASI APPWRITE TIDAK VALID:");
  configErrors.forEach((error) => console.error(`- ${error}`));
  console.error(
    "Silakan pastikan variabel lingkungan Appwrite sudah benar di file .env"
  );
}

// Konfirmasi penggunaan konfigurasi
console.log("Konfigurasi Appwrite yang digunakan:");
console.log({
  endpoint,
  projectId,
  apiKeyLength: apiKey ? apiKey.length : 0,
  apiKeyStart: apiKey ? apiKey.substring(0, 5) + "..." : "tidak ada",
  bucketId,
});

// Inisialisasi client sesuai dengan dokumentasi resmi
const client = new Client();

try {
  client.setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  console.log("Client Appwrite berhasil diinisialisasi");
} catch (error) {
  console.error("ERROR INISIALISASI CLIENT APPWRITE:", error);
}

// Inisialisasi service storage
const storage = new Storage(client);

// Fungsi test koneksi Appwrite
const testAppwriteConnection = async () => {
  try {
    console.log("Menguji koneksi ke Appwrite...");

    // Coba list bucket untuk menguji koneksi dan API key
    const buckets = await storage.listBuckets();

    console.log("Koneksi ke Appwrite berhasil!");
    console.log(`Ditemukan ${buckets.total} bucket.`);

    // Cek jika bucket yang kita gunakan ada
    const bucketExists = buckets.buckets.some(
      (bucket) => bucket.$id === bucketId
    );
    if (bucketExists) {
      console.log(`Bucket dengan ID ${bucketId} ditemukan dan dapat diakses.`);
    } else {
      console.error(`WARNING: Bucket dengan ID ${bucketId} tidak ditemukan!`);
    }

    return true;
  } catch (error) {
    console.error("KONEKSI KE APPWRITE GAGAL:", error);

    if (error.response) {
      console.error("Detail error dari Appwrite:", error.response);
    }

    return false;
  }
};

// Jalankan test koneksi jika bukan di production
if (process.env.NODE_ENV !== "production") {
  testAppwriteConnection()
    .then((success) => {
      if (!success) {
        console.error("Silakan periksa konfigurasi Appwrite Anda");
      }
    })
    .catch((error) => {
      console.error("Error saat menguji koneksi Appwrite:", error);
    });
}

module.exports = {
  client,
  storage,
  BUCKET_ID: bucketId,
  testAppwriteConnection,
};
