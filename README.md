<div align="center">

# 💰 Catatan Keuangan

### *Aplikasi pencatat pemasukan dan pengeluaran harian modern lintas platform berbasis React Native & Laravel API*

![React Native](https://img.shields.io/badge/React_Native-0.86.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-SDK_57-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-Production_API-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<br />

**Catatan Keuangan** adalah aplikasi pelacak keuangan dan arus kas pribadi modern yang dibangun menggunakan **Expo (React Native)** pada sisi antarmuka pengguna dan **Laravel 12 REST API** pada sisi server. Aplikasi ini berjalan lintas platform (**Android, iOS, dan Web**) dengan fokus pada estetika visual elegan, animasi dinamis, pemantauan kurs pasar modal, dan laporan keuangan komprehensif.

[Fitur Utama](#-fitur-utama) • [Teknologi & Database](#-teknologi-api--database) • [Struktur Folder](#-struktur-folder) • [Cara Menjalankan](#-cara-menjalankan) • [Deploy Backend & Frontend](#-deploy)

</div>

---

## 🛠️ Teknologi, API & Database

Aplikasi ini menggunakan arsitektur *Client-Server* terpisah (Decoupled):

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **API Backend** | [Laravel 12](https://laravel.com/) (PHP 8.2+) | RESTful API engine berkinerja tinggi |
| **Autentikasi** | [Laravel Sanctum](https://laravel.com/docs/sanctum) | Manajemen sesi berbasis Bearer Token yang aman |
| **Database** | **SQLite** (`database/database.sqlite`) | Database serverless yang cepat, andal, tanpa konfigurasi berat. Mendukung migrasi ke MySQL / PostgreSQL jika diperlukan |
| **Cloud API** | [Railway](https://railway.com/) | Hosting backend produksi aktif: `https://catatan-keuangan-api-production.up.railway.app/api` |
| **Frontend** | [React Native](https://reactnative.dev/) / [Expo SDK 57](https://expo.dev/) | Antarmuka universal untuk Web, Android, dan iOS |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) | Navigasi berbasis struktur file modern |
| **Bahasa** | [TypeScript](https://www.typescriptlang.org/) | Type-safe development untuk meminimalisir bug |
| **Penyimpanan Lokal** | [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | Menyimpan token otentikasi, preferensi tema, dan URL API |
| **Laporan & PDF** | Expo Print & Expo Sharing | Generator dokumen cetak dan ekspor format A4 standar |

---

## ✨ Fitur Utama

### 📈 Kurs Pasar & Indeks Keuangan Real-Time
- **Market Ticker Interaktif**: Memantau pergerakan **IHSG**, kurs valas (**USD/IDR, EUR/IDR, SGD/IDR, JPY/IDR**), dan harga **Emas Antam** per gram langsung di atas dashboard.
- **Indikator Fluktuasi**: Dilengkapi badge persentase naik/turun dengan warna dinamis.

### 🌌 Desain Estetik & Ambient Nebula Glow
- **Latar Belakang Nebula Mengambang**: Efek ambient glow orbs yang melayang lembut memberikan nuansa modern dan premium.
- **Mode Gelap & Terang Halus**: Transisi warna latar belakang dan kontras kartu yang nyaman di mata pada setiap perangkat.
- **Transisi Tab Bebas Ghosting**: Animasi masuk spring & fade dengan isolasi layar aktif agar tab tidak bertumpuk.

### 📊 Ringkasan Saldo & Rasio Arus Kas
- **Kartu Metrik KPI**: Menampilkan Total Saldo Bersih, Pemasukan Bulanan, dan Pengeluaran Harian secara kontras dan jelas.
- **Rasio Arus Kas Visual**: Progress bar interaktif untuk menilai kesehatan finansial (Surplus vs Defisit).
- **Aksi Cepat**: Tombol pintas untuk catat pengeluaran, transfer, dan unduh rekap.

### 📅 Kalender Transaksi Interaktif
- **Pemilih Bulan & Tahun Fleksibel**: Melompat ke periode bulan atau tahun kapan pun tanpa ribet.
- **Titik Indikator Transaksi**: Tanggal ditandai titik hijau (pemasukan) dan merah (pengeluaran).
- **Badge Tanggal Informatif**: Tanggal hari ini disajikan dengan ukuran font yang mudah dibaca.

### 📑 Laporan Eksekutif & Ekspor PDF Resmi
- **Grafik Kategori**: Analisis pos pengeluaran terbesar dalam format kartu visual.
- **Cetak / Unduh PDF**: Halaman laporan diformat khusus untuk kertas cetak A4 dan otomatis menyembunyikan navigasi aplikasi saat dicetak.

### 🛡️ Panel Khusus Administrator
- **Akses VIP Terproteksi**: Hanya akun terverifikasi admin (`is_admin = true`) yang dapat membuka panel admin.
- **Monitoring Seluruh Sistem**: Melacak jumlah akun pengguna, total volume dana sistem, dan riwayat transaksi pengguna.
- **Konfigurasi URL API Dinamis**: Dukungan pergantian URL server API langsung dari aplikasi tanpa perlu build ulang.

---

## 📂 Struktur Folder Proyek

```plaintext
catatan-keuangan/
├── app/                        # Halaman aplikasi (Expo Router)
│   ├── (app)/                  # Tab navigasi utama
│   │   ├── index.tsx           # Dashboard, saldo, kurs pasar & aksi cepat
│   │   ├── transaksi.tsx       # Form input transaksi (Pemasukan/Pengeluaran)
│   │   ├── riwayat.tsx         # Riwayat kas lengkap + filter kalender
│   │   ├── laporan.tsx         # Rekap analisis keuangan & ekspor PDF
│   │   └── _layout.tsx         # Tab bar responsif (floating dock di desktop)
│   ├── (auth)/                 # Autentikasi
│   │   ├── login.tsx           # Halaman masuk teranimasi
│   │   ├── register.tsx        # Halaman registrasi akun baru
│   │   └── forgot-password.tsx # Halaman pemulihan password
│   ├── admin/                  # Area khusus admin
│   │   ├── index.tsx           # Statistik sistem & konfigurasi server
│   │   └── user/[uid].tsx      # Detail transaksi per pengguna
│   └── _layout.tsx             # Root layout, provider tema, & sinkronisasi web
├── components/                 # Komponen UI
│   ├── AppAmbientBackground.tsx# Animasi partikel nebula floating glow
│   ├── ScreenTransitionWrapper.tsx # Isolasi visibilitas & animasi antar tab
│   ├── CalendarModal.tsx       # Modal kalender interaktif
│   ├── ServerConfigModal.tsx   # Modal pengaturan URL API server
│   ├── ThemeToggle.tsx         # Tombol sakelar dark/light mode
│   └── ui.tsx                  # Card, Button, Input, Chip, Badge
├── constants/                  # Konstanta & tema
│   ├── categories.ts           # Daftar kategori & icon transaksi
│   └── theme.ts                # Skema warna, radius, dan bayangan
├── contexts/                   # State management global
│   ├── AuthContext.tsx         # Sesi pengguna & status admin
│   └── ThemeContext.tsx        # State tema (Dark / Light)
├── services/                   # Jaringan API
│   └── api.ts                  # Axios/Fetch HTTP client & switch URL server
└── vercel.json                 # Konfigurasi deployment web Vercel
```

---

## 🚀 Cara Menjalankan

### 1. Menjalankan Backend (Laravel API & SQLite)
Jika ingin menjalankan backend sendiri di komputer lokal:
```bash
cd catatan-keuangan-api

# 1. Pasang dependensi PHP
composer install

# 2. Salin environment file
cp .env.example .env

# 3. Buat key aplikasi & file database sqlite
php artisan key:generate
touch database/database.sqlite

# 4. Jalankan migrasi dan seeder admin
php artisan migrate --seed

# 5. Jalankan server lokal (Port 8000)
php artisan serve --host=0.0.0.0 --port=8000
```

> **Catatan**: Aplikasi frontend secara *default* sudah otomatis terhubung ke server produksi **Railway** (`https://catatan-keuangan-api-production.up.railway.app/api`), sehingga Anda dapat langsung menjalankan frontend tanpa wajib menyalakan server lokal.

### 2. Menjalankan Frontend (Expo)
Buka terminal pada folder `catatan-keuangan`:
```bash
cd catatan-keuangan

# Pasang dependensi paket
npm install

# Menjalankan versi Web di browser
npm run web

# Menjalankan untuk ponsel (Android / iOS via Expo Go)
npm start
```

---

## 🔐 Manajemen Hak Akses Administrator

Hak akses administrator dikelola langsung dari server backend. Untuk menetapkan hak akses admin pada akun pengguna, jalankan perintah artisan berikut pada terminal backend Anda:

```bash
php artisan tinker --execute="App\Models\User::where('email', 'email_anda@domain.com')->update(['is_admin' => true]);"
```

Setelah itu, login ulang ke dalam aplikasi dan banner emas Administrator akan otomatis aktif di halaman Dashboard.

---

## ☁️ Deploy

### Deploy Frontend ke Vercel / Netlify
1. Hubungkan repository GitHub ini ke **[Vercel](https://vercel.com)**.
2. File `vercel.json` sudah terkonfigurasi:
   - **Build Command**: `npx expo export -p web`
   - **Output Directory**: `dist`
3. Tekan **Deploy**, aplikasi web siap diakses publik.

### Deploy Backend ke Railway
1. Hubungkan folder `catatan-keuangan-api` ke service **[Railway](https://railway.com)**.
2. Gunakan start command: `bash start.sh` atau `php artisan serve --host 0.0.0.0 --port $PORT`.
3. Variabel lingkungan utama: `DB_CONNECTION=sqlite`, `APP_ENV=production`.

---

## 👨‍💻 Lisensi

Dikembangkan oleh **[JerichoNs](https://github.com/JerichoNs)**.  
Proyek ini dilindungi di bawah lisensi **MIT License**.
