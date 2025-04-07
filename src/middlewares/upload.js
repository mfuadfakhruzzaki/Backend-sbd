const multer = require("multer");
const path = require("path");
const { ID } = require("node-appwrite");
const { storage, BUCKET_ID, client } = require("../config/appwrite");
const fs = require("fs");
const os = require("os");

// Setup multer untuk menyimpan file sementara di disk alih-alih di memory
// Ini untuk mengatasi masalah buffer yang mungkin terjadi
const uploadDisk = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      // Gunakan direktori temp sistem
      cb(null, os.tmpdir());
    },
    filename: function (req, file, cb) {
      // Generate nama file unik dengan timestamp
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    console.log("Filtering file:", file.originalname, file.mimetype);

    const allowedTypes = [".jpg", ".jpeg", ".png", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedTypes.includes(ext)) {
      console.log("File ditolak: tipe file tidak diizinkan");
      return cb(
        new Error("Hanya file gambar (jpg, jpeg, png, gif) yang diizinkan")
      );
    }

    cb(null, true);
  },
});

// Middleware untuk handle upload file ke Appwrite
const uploadToAppwrite = () => {
  return async (req, res, next) => {
    try {
      console.log("=== MULAI PROSES UPLOAD KE APPWRITE ===");
      console.log("Headers request:", JSON.stringify(req.headers, null, 2));
      console.log("Method:", req.method, "URL:", req.originalUrl);

      // Handle single dan multiple file upload
      let files = [];
      if (req.file) {
        console.log("Upload tunggal terdeteksi");
        files.push(req.file);
      } else if (req.files && req.files.length > 0) {
        console.log("Upload multiple terdeteksi:", req.files.length, "file");
        files = req.files;
      } else {
        console.log("TIDAK ADA FILE YANG TERDETEKSI DALAM REQUEST");
        console.log("Body request:", req.body);
        return next();
      }

      console.log(`Menemukan ${files.length} file untuk diproses`);

      // Array untuk menyimpan info file
      req.appwriteFiles = [];

      // Proses setiap file
      for (const file of files) {
        try {
          // Validasi file
          if (!file || !file.path) {
            console.error("Objek file tidak valid:", file);
            continue;
          }

          console.log(
            `Memproses file: ${file.originalname}, ukuran: ${file.size} bytes, path: ${file.path}, mimetype: ${file.mimetype}`
          );

          // Generate unique file ID
          const fileId = ID.unique();
          console.log("File ID yang dibuat:", fileId);

          // Nama file dengan timestamp untuk menghindari duplikasi
          const fileName = `${Date.now()}-${path.basename(file.originalname)}`;
          console.log("Nama file yang dibuat:", fileName);

          try {
            // Baca file dari disk
            const fileBuffer = fs.readFileSync(file.path);
            console.log(
              "Berhasil membaca file dari disk, ukuran buffer:",
              fileBuffer.length
            );

            console.log("Konfigurasi Appwrite saat ini:", {
              endpoint: client.config.endpoint,
              projectId: client.config.project,
              bucketId: BUCKET_ID,
              fileId: fileId,
              fileName: fileName,
            });

            // Upload file ke Appwrite
            console.log("Memulai upload ke Appwrite...");
            const result = await storage.createFile(
              BUCKET_ID,
              fileId,
              fileBuffer,
              file.originalname,
              ["*"] // permissions - semua user dapat mengakses
            );

            console.log(
              "Response dari Appwrite:",
              JSON.stringify(result, null, 2)
            );
            console.log(
              `File berhasil diupload ke Appwrite dengan ID: ${fileId}`
            );

            // Buat URL untuk file yang diupload (format sesuai dengan contoh URL Anda)
            const fileUrl = `${client.config.endpoint}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${client.config.project}&mode=admin`;
            console.log("URL file yang dibuat:", fileUrl);

            // Tambahkan informasi file ke response
            req.appwriteFiles.push({
              id: fileId,
              name: fileName,
              url: fileUrl,
              isPlaceholder: false,
            });

            // Hapus file temporary
            fs.unlinkSync(file.path);
            console.log("File temporary dihapus:", file.path);
          } catch (uploadError) {
            console.error(`ERROR SAAT UPLOAD KE APPWRITE:`, uploadError);
            console.error("Stack trace:", uploadError.stack);

            if (uploadError.response) {
              console.error(
                "Detail error dari Appwrite:",
                uploadError.response
              );
            }

            // Buat fallback URL jika upload gagal (untuk development)
            if (process.env.NODE_ENV !== "production") {
              const placeholderUrl = `${client.config.endpoint}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${client.config.project}&mode=admin`;

              console.log(`Menggunakan URL placeholder: ${placeholderUrl}`);

              // Tambahkan informasi file ke response dengan flag isPlaceholder
              req.appwriteFiles.push({
                id: fileId,
                name: fileName,
                url: placeholderUrl,
                isPlaceholder: true,
              });
            } else {
              // Di production, lempar error ke client
              return res.status(500).json({
                status: "error",
                message: "Gagal mengupload file ke Appwrite",
                error: uploadError.message,
              });
            }

            // Tetap hapus file temporary
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
              console.log(
                "File temporary dihapus meskipun terjadi error:",
                file.path
              );
            }
          }
        } catch (fileError) {
          console.error(
            `Error memproses file ${file.originalname}:`,
            fileError
          );
          console.error("Stack trace:", fileError.stack);

          // Tetap hapus file temporary jika ada
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
            console.log("File temporary dihapus setelah error:", file.path);
          }
        }
      }

      if (files.length > 0 && req.appwriteFiles.length === 0) {
        return res.status(500).json({
          status: "error",
          message: "Gagal memproses file",
          error: "Tidak ada file yang berhasil diproses",
        });
      }

      console.log(
        `Berhasil memproses ${req.appwriteFiles.length} file. Data file:`,
        JSON.stringify(req.appwriteFiles, null, 2)
      );
      console.log("=== SELESAI PROSES UPLOAD KE APPWRITE ===");
      next();
    } catch (error) {
      console.error("ERROR DI MIDDLEWARE UPLOAD:", error);
      console.error("Stack trace:", error.stack);

      // Coba bersihkan file temporary jika ada error
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      if (req.files) {
        for (const file of req.files) {
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }

      return res.status(500).json({
        status: "error",
        message: "Error saat memproses file",
        error: error.message,
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
      });
    }
  };
};

module.exports = {
  upload: uploadDisk,
  uploadToAppwrite,
};
