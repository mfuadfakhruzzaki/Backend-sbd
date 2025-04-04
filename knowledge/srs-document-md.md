# Dokumen SRS Web App E-Commerce Barang Bekas Mahasiswa

## 1. Pendahuluan

### 1.1. Latar Belakang
Proyek ini dibuat sebagai tugas akhir praktikum sistem basis data untuk memfasilitasi mahasiswa dalam jual beli barang bekas. Aplikasi ini tidak hanya membantu mahasiswa menghemat biaya, tapi juga mendukung gaya hidup ramah lingkungan dengan mendaur ulang barang yang masih layak pakai.

Selain fitur dasar CRUD, aplikasi ini dilengkapi dengan fitur tambahan seperti chat real-time, rating & review, wishlist, dan laporan konten guna meningkatkan keamanan dan kenyamanan transaksi.

### 1.2. Tujuan
- Menyediakan platform bagi mahasiswa untuk jual beli barang bekas dengan mudah dan aman.
- Mengintegrasikan basis data yang mendukung fungsi Create, Read, Update, Delete (termasuk soft delete dan hard delete).
- Memenuhi persyaratan tugas akhir praktikum basis data dengan minimal 3 tabel, constraint, ERD, halaman join query, dan fitur autentikasi.
- Meningkatkan interaksi antar pengguna dengan fitur chat, notifikasi, rating & review, serta wishlist.

### 1.3. Ruang Lingkup
Aplikasi ini meliputi:
- Manajemen pengguna: Registrasi, login, dan manajemen profil.
- Manajemen barang: Upload, edit, hapus (soft/hard delete) barang bekas.
- Transaksi: Proses pembelian, riwayat transaksi, dan sistem penilaian.
- Interaksi: Fitur chat antara penjual dan pembeli serta laporan konten yang mencurigakan.
- Fitur tambahan: Pencarian, filter berdasarkan kampus, notifikasi, dan wishlist.

## 2. Deskripsi Umum

### 2.1. Gambaran Sistem
Sistem akan memberikan pengalaman berbelanja online yang aman, mudah, dan interaktif dengan:
- User Interface yang simpel dan responsif, lengkap dengan navbar untuk navigasi.
- Basis data terintegrasi yang menyimpan data pengguna, barang, transaksi, chat, rating, dan wishlist.
- Keamanan transaksi dengan autentikasi login dan fitur laporan konten untuk meminimalisir kecurangan.

### 2.2. Aktor Sistem
- **Mahasiswa (User):**
  - Sebagai penjual barang bekas.
  - Sebagai pembeli barang bekas.
- **Admin:**
  - Mengawasi, memoderasi, dan melakukan validasi konten.
  - Menangani laporan konten dan mengelola data aplikasi.

### 2.3. Lingkungan Operasi
- **Frontend:** React
- **Backend:** Node.js dengan Express
- **Database:** MySQL
- **Deployment:** Docker Compose (termasuk container untuk MySQL)
- **Version Control:** Aplikasi akan diupload dan dikelola melalui repository GitHub.

## 3. Persyaratan Fungsional

### 3.1. Manajemen Pengguna (USER)
- **Registrasi dan Login:**
  - Mahasiswa dapat mendaftar menggunakan email kampus.
  - Validasi email dan password wajib.
  - Autentikasi untuk mengakses fitur-fitur aplikasi.
- **Manajemen Profil:**
  - Update data profil (nama, email, password, dll).
  - Opsi reset password.

### 3.2. Manajemen Barang (BARANG)
- **Create:**
  - Pengguna dapat mengupload barang dengan informasi: judul, deskripsi, foto (multiple), harga, kategori, kondisi, lokasi.
  - Sistem secara otomatis menyimpan waktu pembuatan (created_at) dan user_id pemilik.
- **Read:**
  - Menampilkan daftar barang beserta detail lengkap.
  - Fitur pencarian dan filter (berdasarkan kategori, harga, kondisi, kampus, lokasi).
  - Menampilkan informasi tambahan seperti jumlah views dan status ketersediaan.
- **Update:**
  - Pengguna dapat mengedit informasi barang yang sudah diupload.
  - Sistem mencatat waktu update otomatis (updated_at).
  - Hanya pemilik barang yang dapat mengedit informasi barangnya.
- **Delete:**
  - Soft Delete: Menandai barang sebagai tidak aktif dengan status_delete=true dan mencatat deleted_at (tetap tersimpan di basis data).
  - Hard Delete: Menghapus barang secara permanen (hanya untuk admin).

### 3.3. Transaksi (TRANSAKSI)
- **Pencatatan Transaksi:**
  - Menyimpan data pembelian antara pembeli dan penjual (barang_id, seller_id, buyer_id, tanggal_transaksi, metode_pembayaran, total_harga, status).
  - Sistem mencatat perubahan status transaksi dengan timestamp.
- **Halaman Join Data:**
  - Menampilkan riwayat transaksi yang menggabungkan data dari tabel USER, BARANG, dan TRANSAKSI.
  - Menampilkan detail transaksi dengan informasi penjual, pembeli, barang, dan status.
  - Menyediakan filter dan sorting berdasarkan tanggal, status, atau nominal transaksi.
- **Notifikasi Transaksi:**
  - Pengguna mendapatkan notifikasi jika ada update status transaksi.
  - Notifikasi disimpan dalam sistem dan dapat diakses melalui panel notifikasi.
  - Notifikasi menampilkan status "dibaca" atau "belum dibaca".

### 3.4. Interaksi (CHAT)
- **Chat Real-Time:**
  - Fitur chat antara penjual dan pembeli.
  - Menyediakan notifikasi pesan masuk.

### 3.5. Rating dan Review (RATING)
- **Memberi Rating:**
  - Pengguna dapat memberikan rating (misalnya 1-5) dan review setelah transaksi selesai.
  - Data review ditampilkan pada halaman detail barang atau profil penjual.

### 3.6. Wishlist (WISHLIST)
- **Menyimpan Barang Favorit:**
  - Pengguna dapat menyimpan barang ke dalam wishlist untuk dilihat kembali di lain waktu.

### 3.7. Laporan Konten
- **Pelaporan Iklan/Pengguna:**
  - Pengguna dapat melaporkan iklan atau aktivitas mencurigakan.
  - Pengguna harus memilih kategori alasan pelaporan (penipuan, konten tidak pantas, barang ilegal, dll).
  - Sistem menyimpan laporan dengan status "pending" untuk ditinjau admin.
  - Laporan dikirim ke admin untuk ditindaklanjuti dengan status yang dapat diubah menjadi "diproses", "selesai", atau "ditolak".

### 3.8. Navbar dan Navigasi
- **Navigasi Konsisten:**
  - Navbar wajib tersedia di setiap halaman dengan menu: Home, Cari Barang, Upload Barang, Chat, Wishlist, Profil, dan Laporan (untuk admin).

## 4. Persyaratan Non-Fungsional

### 4.1. Kinerja
- Halaman harus dimuat dalam waktu kurang dari 3 detik.
- Optimasi query database agar join data tidak memberatkan sistem.

### 4.2. Keamanan
- Enkripsi password saat penyimpanan.
- Penggunaan token untuk sesi autentikasi.
- Proteksi terhadap SQL Injection dan serangan web umum lainnya.

### 4.3. Skalabilitas
- Sistem harus mampu menangani peningkatan jumlah data dan pengguna.
- Arsitektur modular agar mudah menambah fitur di masa depan.

### 4.4. Ketersediaan
- Aplikasi harus tersedia 24/7 dengan downtime minimal.
- Backup rutin basis data untuk menghindari kehilangan data.

### 4.5. Dokumentasi dan Deployment
- Dokumentasi lengkap (README, ERD, setup guide) wajib diunggah ke GitHub.
- Kode harus dikomentari dengan jelas untuk memudahkan pengembangan dan pemeliharaan.

## 5. Batasan dan Asumsi

### 5.1. Batasan
- Aplikasi hanya diakses oleh mahasiswa yang terverifikasi melalui email kampus.
- Fitur chat dan notifikasi hanya dapat diakses oleh pengguna yang sudah login.
- Laporan konten hanya dapat diajukan oleh pengguna yang terverifikasi.

### 5.2. Asumsi
- Setiap transaksi dilakukan antara dua pihak (penjual dan pembeli).
- Data barang bersifat dinamis dan dapat diupdate atau dihapus sesuai kebutuhan pengguna.
- Admin bertanggung jawab memoderasi konten dan menangani laporan pengguna.

## 6. Diagram ERD

Diagram ERD yang lebih komprehensif mencakup entitas dan relasi berikut:

### 6.1. Entitas dan Atribut

#### USER
- **PK**: user_id (INT, AUTO_INCREMENT)
- nama (VARCHAR(100), NOT NULL)
- email (VARCHAR(100), NOT NULL, UNIQUE)
- password (VARCHAR(255), NOT NULL)
- profile_picture (VARCHAR(255))
- nomor_telepon (VARCHAR(15))
- alamat (TEXT)
- kampus (VARCHAR(100))
- role (ENUM('mahasiswa', 'admin'), DEFAULT 'mahasiswa')
- status_akun (ENUM('aktif', 'diblokir'), DEFAULT 'aktif')
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
- deleted_at (TIMESTAMP, NULL)

#### KATEGORI
- **PK**: kategori_id (INT, AUTO_INCREMENT)
- nama_kategori (VARCHAR(50), NOT NULL)
- deskripsi (TEXT)
- icon (VARCHAR(255))
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

#### BARANG
- **PK**: barang_id (INT, AUTO_INCREMENT)
- **FK**: user_id (INT, REFERENCES USER(user_id))
- **FK**: kategori_id (INT, REFERENCES KATEGORI(kategori_id))
- judul (VARCHAR(100), NOT NULL)
- deskripsi (TEXT, NOT NULL)
- foto (JSON) -- Menyimpan array path foto
- harga (DECIMAL(10,2), NOT NULL)
- lokasi (VARCHAR(100))
- kondisi (ENUM('baru', 'seperti baru', 'bekas', 'rusak ringan'), NOT NULL)
- views_count (INT, DEFAULT 0)
- status (ENUM('tersedia', 'terjual', 'dipesan'), DEFAULT 'tersedia')
- status_delete (BOOLEAN, DEFAULT FALSE)
- deleted_at (TIMESTAMP, NULL)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

#### TRANSAKSI
- **PK**: transaksi_id (INT, AUTO_INCREMENT)
- **FK**: barang_id (INT, REFERENCES BARANG(barang_id))
- **FK**: seller_id (INT, REFERENCES USER(user_id))
- **FK**: buyer_id (INT, REFERENCES USER(user_id))
- tanggal_transaksi (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- metode_pembayaran (VARCHAR(50))
- total_harga (DECIMAL(10,2), NOT NULL)
- status (ENUM('pending', 'dibayar', 'diproses', 'dikirim', 'selesai', 'dibatalkan'), DEFAULT 'pending')
- catatan (TEXT)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

#### CHAT
- **PK**: chat_id (INT, AUTO_INCREMENT)
- **FK**: sender_id (INT, REFERENCES USER(user_id))
- **FK**: receiver_id (INT, REFERENCES USER(user_id))
- **FK**: barang_id (INT, REFERENCES BARANG(barang_id), NULL) -- Opsional, jika chat tentang barang tertentu
- pesan (TEXT, NOT NULL)
- status_dibaca (BOOLEAN, DEFAULT FALSE)
- tanggal (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

#### RATING
- **PK**: rating_id (INT, AUTO_INCREMENT)
- **FK**: transaksi_id (INT, REFERENCES TRANSAKSI(transaksi_id), UNIQUE)
- **FK**: reviewer_id (INT, REFERENCES USER(user_id))
- **FK**: reviewed_id (INT, REFERENCES USER(user_id))
- nilai (TINYINT, NOT NULL, CHECK (nilai BETWEEN 1 AND 5))
- review (TEXT)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

#### WISHLIST
- **PK**: wishlist_id (INT, AUTO_INCREMENT)
- **FK**: user_id (INT, REFERENCES USER(user_id))
- **FK**: barang_id (INT, REFERENCES BARANG(barang_id))
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- **UNIQUE INDEX**: (user_id, barang_id) -- Mencegah duplikasi wishlist

#### NOTIFIKASI
- **PK**: notifikasi_id (INT, AUTO_INCREMENT)
- **FK**: user_id (INT, REFERENCES USER(user_id))
- judul (VARCHAR(100), NOT NULL)
- pesan (TEXT, NOT NULL)
- jenis (ENUM('transaksi', 'chat', 'sistem'), NOT NULL)
- is_read (BOOLEAN, DEFAULT FALSE)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

#### LAPORAN
- **PK**: laporan_id (INT, AUTO_INCREMENT)
- **FK**: reporter_id (INT, REFERENCES USER(user_id))
- item_type (ENUM('barang', 'pengguna'), NOT NULL)
- **FK**: reported_item_id (INT) -- Bisa merujuk ke barang_id atau user_id
- alasan (TEXT, NOT NULL)
- status (ENUM('pending', 'diproses', 'selesai', 'ditolak'), DEFAULT 'pending')
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

### 6.2. Relasi dan Kardinalitas

- USER (1) --< BARANG (N): Satu pengguna dapat menjual banyak barang
- USER (1) --< TRANSAKSI (N) (as buyer): Satu pengguna dapat melakukan banyak pembelian
- USER (1) --< TRANSAKSI (N) (as seller): Satu pengguna dapat menerima banyak pembelian
- BARANG (1) -- TRANSAKSI (1): Satu barang terlibat dalam satu transaksi (jika sudah terjual)
- USER (1) --< CHAT (N) (as sender): Satu pengguna dapat mengirim banyak pesan
- USER (1) --< CHAT (N) (as receiver): Satu pengguna dapat menerima banyak pesan
- TRANSAKSI (1) -- RATING (1): Satu transaksi dapat dinilai satu kali
- USER (N) >--< BARANG (M): Banyak pengguna dapat menyimpan banyak barang di wishlist (implementasi melalui tabel WISHLIST)
- USER (1) --< NOTIFIKASI (N): Satu pengguna dapat menerima banyak notifikasi
- USER (1) --< LAPORAN (N) (as reporter): Satu pengguna dapat melaporkan banyak item
- KATEGORI (1) --< BARANG (N): Satu kategori dapat memiliki banyak barang

### 6.3. Indeks untuk Optimasi Query

- USER: Indeks pada email untuk pencarian saat login
- BARANG: Indeks pada kategori_id, user_id, dan status untuk pencarian dan filtering
- TRANSAKSI: Indeks pada buyer_id, seller_id, dan status untuk riwayat transaksi
- CHAT: Indeks pada sender_id, receiver_id, dan tanggal untuk menampilkan history chat
- NOTIFIKASI: Indeks pada user_id dan is_read untuk menampilkan notifikasi belum dibaca
- WISHLIST: Indeks komposit pada (user_id, barang_id) untuk cek duplikasi dan pencarian cepat

## 7. Teknologi yang Digunakan

### 7.1. Frontend
- **Framework:** React
- HTML, CSS, JavaScript
- Responsiveness dengan Bootstrap atau framework CSS lainnya

### 7.2. Backend
- **Bahasa Pemrograman:** Node.js dengan Express
- API untuk meng-handle CRUD, autentikasi, dan fitur chat

### 7.3. Database
- **Sistem Basis Data:** MySQL
- **Integritas Data:**
  - Penggunaan constraint seperti foreign key, unique, dan check untuk menjaga integritas data.
  - Implementasi CASCADE, SET NULL, atau RESTRICT pada foreign key untuk menangani penghapusan data.
  - Menggunakan indeks untuk optimasi query pada kolom yang sering diakses.
- **Normalisasi:**
  - Database dirancang mengikuti prinsip normalisasi minimal hingga bentuk normal ketiga (3NF).
  - Implementasi timestamps (created_at, updated_at, deleted_at) untuk audit trail.
- **Backup & Recovery:**
  - Sistem backup otomatis menggunakan fitur MySQL dan Docker volume.
  - Strategi recovery dengan point-in-time recovery capability.

### 7.4. Deployment & Version Control
- **Repository:** GitHub
- **Deployment:** Docker Compose (termasuk container untuk MySQL)

## 8. Rencana Pengujian

### 8.1. Pengujian Fungsional
- **User Testing:**
  - Registrasi, login, dan update profil
  - CRUD data barang, transaksi, chat, rating, dan wishlist
- **Integration Testing:**
  - Pastikan relasi antar tabel bekerja dengan baik (misalnya join query antara USER, BARANG, dan TRANSAKSI)

### 8.2. Pengujian Non-Fungsional
- **Performance Testing:**
  - Uji waktu respon halaman dan query database
- **Security Testing:**
  - Uji sistem autentikasi dan proteksi terhadap serangan SQL Injection

## 9. Rencana Implementasi
- **Analisis & Desain:**
  - Membuat ERD dan desain UI/UX
  - Persiapan dokumentasi dan setup GitHub
- **Pengembangan:**
  - Implementasi backend dan frontend secara paralel
  - Pembuatan DDL, API, dan fitur-fitur dasar
- **Pengujian:**
  - Melakukan testing unit, integration, dan security testing
- **Deployment & Evaluasi:**
  - Deploy aplikasi dengan Docker Compose
  - Evaluasi feedback pengguna dan perbaikan bug

## 10. Penutup
Dokumen SRS ini merupakan acuan awal untuk pengembangan web app e-commerce barang bekas mahasiswa. Dokumen dapat diperbarui sesuai dengan masukan dari asisten pembimbing dan tim pengembang.

Semoga dokumen ini membantu dalam penyusunan dan implementasi sistem, dan sukses untuk tugas akhirnya!
