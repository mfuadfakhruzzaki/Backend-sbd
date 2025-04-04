# E-Commerce Barang Bekas Mahasiswa - Backend

Backend REST API untuk aplikasi E-Commerce Barang Bekas Mahasiswa menggunakan Express.js, MySQL, dan Sequelize dengan integrasi Appwrite untuk penyimpanan gambar.

## Fitur

- Autentikasi dan otorisasi pengguna (mahasiswa dan admin)
- CRUD data barang
- Pengelolaan transaksi
- Pengelolaan kategori
- Penyimpanan gambar menggunakan Appwrite Storage

## Persyaratan

- Node.js (v14 atau lebih baru)
- MySQL (v5.7 atau lebih baru)
- Docker & Docker Compose (opsional, untuk deployment)
- Akun Appwrite untuk penyimpanan gambar

## Konfigurasi Appwrite

Aplikasi ini menggunakan Appwrite untuk penyimpanan gambar. Berikut langkah-langkah untuk mengkonfigurasi Appwrite:

1. Buat akun di [Appwrite](http://tugas-akhir-sbd-appwrite-baa3ca-34-50-95-184.traefik.me/)
2. Buat project baru
3. Buat Storage Bucket baru dengan izin upload dan delete
4. Buat API key baru dengan izin untuk storage
5. Update file .env dengan informasi Appwrite:
   ```
   APPWRITE_ENDPOINT=http://tugas-akhir-sbd-appwrite-baa3ca-34-50-95-184.traefik.me/v1
   APPWRITE_PROJECT_ID=your_project_id
   APPWRITE_API_KEY=your_api_key
   APPWRITE_BUCKET_ID=your_bucket_id
   ```

## Instalasi

### Menggunakan Docker (Disarankan)

1. Clone repository

```
git clone https://github.com/username/e-commerce-barang-bekas.git
cd e-commerce-barang-bekas
```

2. Siapkan file environment

```
cp .env.example .env
```

Sesuaikan nilai JWT_SECRET dan konfigurasi Appwrite di file .env

3. Jalankan dengan Docker Compose

```
docker-compose up -d
```

4. Seeder database (optional)

```
docker-compose exec backend npm run seed
```

### Instalasi Manual

1. Clone repository

```
git clone https://github.com/username/e-commerce-barang-bekas.git
cd e-commerce-barang-bekas
```

2. Install dependensi

```
npm install
```

3. Buat database MySQL

```
CREATE DATABASE ecommerce_mahasiswa;
```

4. Setting konfigurasi lingkungan

   - Salin file .env.example menjadi .env
   - Sesuaikan konfigurasi database, secret key JWT, dan konfigurasi Appwrite

5. Jalankan migrasi dan seed database

```
npm run seed
```

## Menjalankan Aplikasi

### Development

```
npm run dev
```

### Production

```
npm start
```

## Struktur API

### Auth

- POST /api/auth/register - Registrasi pengguna baru
- POST /api/auth/login - Login pengguna
- GET /api/auth/me - Mendapatkan data pengguna yang sedang login
- PUT /api/auth/update-profile - Update profil pengguna
- PUT /api/auth/change-password - Ganti password

### Kategori

- GET /api/kategori - Mendapatkan semua kategori
- GET /api/kategori/:id - Mendapatkan detail kategori
- POST /api/kategori - Membuat kategori baru (admin)
- PUT /api/kategori/:id - Update kategori (admin)
- DELETE /api/kategori/:id - Hapus kategori (admin)

### Barang

- GET /api/barang - Mendapatkan semua barang dengan filter
- GET /api/barang/:id - Mendapatkan detail barang
- GET /api/barang/user/items - Mendapatkan barang milik pengguna
- POST /api/barang - Membuat barang baru
- PUT /api/barang/:id - Update barang
- DELETE /api/barang/:id - Soft delete barang
- DELETE /api/barang/:id/hard - Hard delete barang (admin)

### Transaksi

- POST /api/transaksi - Membuat transaksi baru
- GET /api/transaksi - Mendapatkan semua transaksi pengguna
- GET /api/transaksi/:id - Mendapatkan detail transaksi
- PUT /api/transaksi/:id/status - Update status transaksi

## Penyimpanan Gambar (Appwrite)

Aplikasi ini menggunakan Appwrite Storage untuk menyimpan gambar barang. Beberapa fitur yang tersedia:

- Upload multiple gambar saat membuat atau mengedit barang
- Hapus gambar yang tidak diinginkan
- Sistem hanya menyimpan URL gambar di database untuk mengoptimalkan penyimpanan
- File utility untuk mengelola file di Appwrite walaupun hanya menyimpan URL di database

## Docker Deployment

Aplikasi ini sudah dilengkapi dengan konfigurasi Docker untuk memudahkan deployment:

- `Dockerfile`: Konfigurasi untuk membangun image Docker backend
- `docker-compose.yml`: Konfigurasi untuk menjalankan backend dan MySQL secara bersamaan

### Perintah Docker yang Berguna

- Membangun dan menjalankan kontainer:

```
docker-compose up -d
```

- Melihat log aplikasi:

```
docker-compose logs -f backend
```

- Masuk ke shell kontainer backend:

```
docker-compose exec backend sh
```

- Menghentikan kontainer:

```
docker-compose down
```

- Menghentikan dan menghapus volume data:

```
docker-compose down -v
```

## Admin Account

- Email: admin@example.ac.id
- Password: admin123

## Production Deployment

### Prerequisites

- Docker and Docker Compose
- Make (optional, for using the Makefile commands)

### Environment Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/ecommerce-backend.git
   cd ecommerce-backend
   ```

2. Create an `.env` file based on the example:

   ```bash
   cp .env.example .env
   ```

3. Update the environment variables in `.env` with your production values.

### Deployment with Docker

Build and run the application:

```bash
# Using Make
make build
make run

# OR using Docker Compose directly
docker-compose build
docker-compose up -d
```

### Monitoring

View logs:

```bash
# Using Make
make logs      # Backend logs
make db-logs   # Database logs

# OR using Docker Compose directly
docker-compose logs -f backend
docker-compose logs -f mysql
```

### Database Management

Backup and restore:

```bash
# Create backup
make db-backup

# Restore from backup
make db-restore FILE=backups/your-backup-file.sql
```

### Scaling and Performance

The application is configured with connection pooling and retry mechanisms for improved reliability.

## Development Environment

Start the development environment with hot-reloading:

```bash
make dev

# OR
NODE_ENV=development docker-compose up
```

## API Documentation

The API is versioned and accessible at `/api/v1`. To see available API versions, visit the root API endpoint:

```
GET /api
```

## Technologies Used

- Node.js and Express
- MySQL with Sequelize ORM
- JWT Authentication
- Appwrite (for file storage)
- Docker and Docker Compose for containerization

## License

[MIT License](LICENSE)
