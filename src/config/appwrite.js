const { Client, Storage } = require("node-appwrite");
const dotenv = require("dotenv");

dotenv.config();

// Konfigurasi Appwrite dari environment
const endpoint =
  process.env.APPWRITE_ENDPOINT ||
  "http://tugas-akhir-sbd-appwrite-baa3ca-34-50-95-184.traefik.me/v1";
const projectId = process.env.APPWRITE_PROJECT_ID || "67ec168f001774966f85";
const apiKey =
  process.env.APPWRITE_API_KEY ||
  "standard_c198465575b7925e70d344fe9b76414e306f0d2f3d6137371e23a36bbf48c0d89f884981271b0f7de15b9d2162badf9cdaab963560bc99cc6278e99b02f17cb1d08d5cd81140c8c09397fcf503a3a2c1f4dd2056f46eb57d16bdd315f2b74e38600bd82e0ab061eb1786697cf7c1aa94e7a1bed5d0747f7e4fec6ac0bfb602f3";
const bucketId = process.env.APPWRITE_BUCKET_ID || "67ec16ad001dd1f0a484";

// Konfirmasi penggunaan konfigurasi
console.log("Appwrite Config:", {
  endpoint,
  projectId,
  apiKeyLength: apiKey.length,
  bucketId,
});

// Inisialisasi client sesuai dengan dokumentasi resmi
const client = new Client();

client.setEndpoint(endpoint).setProject(projectId).setKey(apiKey);

// Inisialisasi service storage
const storage = new Storage(client);

module.exports = {
  client,
  storage,
  BUCKET_ID: bucketId,
};
