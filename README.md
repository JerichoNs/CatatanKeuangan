# 💵 Catatan Keuangan

Halo! 👋 Ini projek aplikasi pencatat keuangan harian yang kubikin pake **Expo (React Native)** untuk aplikasinya dan **Laravel 12 (Sanctum API)** untuk backend-nya.

Awalnya projek ini sempat pake Firebase, tapi akhirnya kumigrasi total ke **Laravel REST API** biar arsitekturnya lebih rapi, datanya gampang di-manage, dan enak buat belajar integrasi fullstack antara React Native dan PHP.

Bisa dibuka di **Web browser**, di-scan lewat **Expo Go (HP)**, dan udah siap langsung di-deploy ke **Vercel**.

---

## ⚡ Fitur-Fitur Serunya

- **🌓 Dark Mode & Light Mode yang Beneran Smooth**:
  Transisinya nggak kaku atau sekadar ganti warna mendadak. Ada interpolasi warna + animasi elastis di switch-nya, plus efek transisi halus di web biar nyaman di mata.
- **📅 Kalender Interaktif di Riwayat**:
  Nggak perlu lagi klik panah bolak-balik satu per satu cuma buat ngecek transaksi beberapa bulan lalu. Tinggal buka modal kalender, pilih tahun/bulan langsung lompat, atau klik tanggal spesifik buat filter hari itu. Tanggal yang ada transaksinya juga ada titik indikatornya (hijau buat pemasukan, merah buat pengeluaran).
- **📊 Ringkasan Saldo & Grafik Rasio**:
  Lihat total saldo, total pemasukan, dan pengeluaran secara visual. Ada rasio bar langsung buat ngeliat persentase uang yang masuk vs uang yang keluar.
- **🔄 Opsi & Reset di Dashboard**:
  Di kartu saldo ada tombol *Opsi & Reset* buat reload data kapan aja, ganti preset tema, atau reset/bersihin semua catatan transaksi akun kalau mau mulai dari nol lagi.
- **📑 Ekspor Laporan ke PDF**:
  Bisa langsung cetak atau simpan rekap transaksi bulanan dalam bentuk dokumen PDF yang rapi (support cetak langsung di browser atau share file di HP).
- **🛡️ Panel Admin Khusus**:
  Akun yang ditandai sebagai admin (`is_admin = true`) punya akses ke halaman admin buat pantau total pengguna, total volume transaksi global, dan riwayat transaksi semua user.
- **🌐 Konfigurasi IP Fleksibel**:
  Khusus buat admin, ada menu pengaturan IP terpisah (IP Publik dan IP Admin) lengkap dengan tombol tes koneksi dan preset cepat buat HP (LAN), Localhost (PC), atau Emulator Android.

---

## 🛠️ Tech Stack yang Dipake

- **Frontend**: React Native, Expo SDK 57, Expo Router, TypeScript.
- **Backend**: Laravel 12, Laravel Sanctum (Token Auth), SQLite / MySQL.
- **Styling & Animasi**: Vanilla React Native StyleSheet, React Native Animated API, LayoutAnimation.
- **Ekspor PDF**: Expo Print & Expo Sharing.
- **Deployment**: Vercel (untuk Web Frontend).

---

## 🚀 Cara Jalanin di Komputer Kamu

### 1. Nyalain Backend (Laravel)
Pastikan kamu udah install PHP (minimal v8.2) dan Composer:

```bash
cd catatan-keuangan-api

# Install dependency kalau baru pertama kali clone
composer install

# Siapin database & migrasi tabel
php artisan migrate

# Jalankan server API (default port 8000)
php artisan serve --host=0.0.0.0 --port=8000
```

Kalau mau jalanin server admin terpisah di port 8001:
```bash
php artisan serve --host=0.0.0.0 --port=8001
```

### 2. Nyalain Frontend (React Native / Expo)
Buka terminal baru di folder frontend:

```bash
cd catatan-keuangan

# Install paket npm
npm install

# Buka versi Web
npm run web

# Atau buka buat HP (Expo Go)
npm start
```
Tinggal scan QR code-nya pake aplikasi **Expo Go** di HP Android atau kamera iPhone kamu.

---

## ☁️ Cara Deploy Web ke Vercel

Di repo ini udah include file `vercel.json` dan script build web `build:web`. Jadi deploy-nya gampang banget:

1. Push repo ini ke akun GitHub kamu.
2. Buka [vercel.com](https://vercel.com) dan klik **Add New Project**.
3. Pilih repository ini, biarkan build command otomatis (`npm run build:web`) dan output folder `dist`.
4. Klik **Deploy** dan selesai! Web kamu langsung live.

---

## 📌 Catatan Tambahan

- **Akun Admin**: Kalau mau bikin akun jadi admin, cukup buka tinker di folder backend:
  ```bash
  php artisan tinker --execute="App\Models\User::where('email', 'email_kamu@gmail.com')->update(['is_admin' => true]);"
  ```
  Setelah itu logout lalu login ulang di aplikasi. Banner admin emas bakal otomatis nongol di atas dashboard.

---

Dibikin sama **[Jericho](https://github.com/JerichoNs)**. Kalau projek ini bermanfaat buat referensi belajar kamu, boleh tinggalin bintang ⭐ di repo ini ya!
