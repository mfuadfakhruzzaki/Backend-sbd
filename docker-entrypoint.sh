#!/bin/sh
set -e

# Log information with timestamp
log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') $1"
}

# Fungsi untuk memeriksa koneksi MySQL
check_mysql() {
  log "Checking MySQL connection..."
  node -e "
    const mysql = require('mysql2/promise');
    const config = {
      host: process.env.DB_HOST || 'mysql',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password123',
      database: process.env.DB_NAME || 'ecommerce_mahasiswa',
      connectTimeout: 5000
    };
    
    console.log('Connecting with config:', JSON.stringify({
      ...config,
      password: '********' // Hide password in logs
    }));
    
    mysql.createConnection(config).then(connection => {
      console.log('MySQL connection successful');
      connection.end();
      process.exit(0);
    }).catch(err => {
      console.error('MySQL connection failed:', err.message);
      process.exit(1);
    });
  "
  return $?
}

# Maksimum percobaan
MAX_TRIES=30
# Interval antar percobaan (detik)
INTERVAL=2

# Tunggu MySQL
log "Waiting for MySQL to be ready..."
COUNT=0
until check_mysql || [ $COUNT -gt $MAX_TRIES ]; do
  log "MySQL not ready yet, waiting... (attempt $COUNT/$MAX_TRIES)"
  sleep $INTERVAL
  COUNT=$((COUNT+1))
done

if [ $COUNT -gt $MAX_TRIES ]; then
  log "WARNING: MySQL did not become ready in time. Starting application anyway and will retry connection later."
else
  log "MySQL is ready. Starting application..."
fi

# Handle SIGTERM
trap 'log "Received SIGTERM signal, shutting down gracefully..."; kill -TERM $child; wait $child' TERM

# Jalankan perintah yang diberikan
exec "$@" &
child=$!

# Wait for child process
wait $child 