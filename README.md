<div align="center">

# 💰 Catatan Keuangan

### *Aplikasi Manajemen Keuangan Cerdas, Modern & Elegan*

![React Native](https://img.shields.io/badge/React_Native-0.86.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-SDK_57-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Ready-000000?style=for-the-badge&logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<br />

**Catatan Keuangan** adalah aplikasi pencatatan dan analisis arus keuangan pribadi yang dibangun menggunakan **Expo (React Native)** pada sisi Frontend dan **Laravel 12 (REST API + Sanctum)** pada sisi Backend. Dirancang dengan mengutamakan estetika visual premium, performa tinggi, animasi yang halus, dan kemudahan penggunaan lintas platform (Android, iOS, dan Web).

[Fitur Utama](#-fitur-utama) • [Tangkapan Layar](#-tampilan-antarmuka) • [Teknologi](#-teknologi--stack) • [Instalasi & Menjalankan](#-cara-menjalankan) • [Deploy Vercel](#-deploy-ke-vercel)

</div>

---

## ✨ Fitur Utama

### 🌙 1. Mode Gelap & Terang dengan Animasi Halus *(Animated Theme)*
- **Transisi Mulus (*Fluid Organic Transition*)**: Menggunakan interpolasi warna dinamis dan *bezier curves*, berpindah antara tema gelap dan terang terasa sangat lembut dan tidak kaku (*no harsh snaps*).
- **Tombol Toggle Switch Interaktif**: Tombol geser modern dengan animasi rotasi 360° dan *cross-fade* ikon matahari dan bulan.
- **Penyimpanan Otomatis**: Preferensi tema disimpan di `AsyncStorage` dan otomatis sinkron dengan tema sistem perangkat.

### 📅 2. Kalender Interaktif & Lompat Cepat *(Interactive Calendar)*
- **Lompat Cepat Bulan/Tahun**: Tak perlu menggeser panah satu per satu! Cukup sentuh pemilih tahun dan pilih salah satu dari 12 bulan untuk melompat seketika ke periode manapun.
- **Grid Tanggal Lengkap (1–31)**: Kalender visual bulanan untuk memilih transaksi per hari.
- **Indikator Titik Transaksi *(Dots)***: Menampilkan dot hijau (pemasukan) dan dot merah (pengeluaran) pada setiap tanggal yang memiliki riwayat aktivitas.
- **Filter Fleksibel**: Filter daftar transaksi berdasarkan tanggal spesifik atau tampilkan rekap satu bulan penuh.

### 📊 3. Dashboard Finansial & Analisis Cerdas
- **Kartu Saldo Dinamis**: Tampilan total saldo, total pemasukan, dan total pengeluaran dengan latar belakang gradasi elegan.
- **Bar Rasio Real-Time**: Visualisasi persentase rasio pemasukan berbanding pengeluaran.
- **Kategori Terlengkap**: Dilengkapi kategori dengan ikon warna-warni (Makanan, Transportasi, Belanja, Tagihan, Hiburan, Gaji, Bonus, dll).

### 📑 4. Laporan Bulanan & Ekspor PDF
- **Rekap Arus Kas**: Ringkasan saldo bersih bulanan dengan badge otomatis **Surplus** atau **Defisit**.
- **Analisis Kategori**: Bar chart visual pengeluaran berdasarkan proporsi kategori terbesar.
- **Ekspor Dokumen PDF**: Cetak atau bagikan laporan keuangan bulanan lengkap ke file PDF dalam satu klik.

### 🛡️ 5. Panel Admin Eksklusif *(Role-Based Access)*
- **Akses Terproteksi**: Dilindungi oleh token autentikasi Sanctum dan verifikasi role `is_admin`.
- **Statistik Global**: Memantau total pengguna terdaftar, jumlah transaksi global, dan volume perputaran dana.
- **Manajemen Pengguna**: Melihat daftar user beserta riwayat transaksi detail masing-masing akun.
- **Pengaturan IP Terpusat**: Fitur konfigurasi IP publik dan admin yang hanya bisa diakses oleh akun Admin.

### 🌐 6. Dukungan Multi-Environment & Dual IP
- **Pemisahan API Publik & Admin**: Dukungan port dan IP berbeda antara endpoint pengguna dan endpoint admin untuk keamanan ekstra.
- **Preset Satu Klik**: Pilihan cepat IP LAN (`192.168.1.x`), Komputer/Web (`localhost`), atau Emulator Android (`10.0.2.2`).
- **Live Connection Tester**: Mengetes status konektivitas server secara langsung dari aplikasi.

---

## 🛠️ Teknologi & Stack

| Bagian | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Frontend Framework** | [React Native](https://reactnative.dev/) / [Expo 57](https://expo.dev/) | Cross-platform (Android, iOS, Web) |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) | File-based navigation |
| **Bahasa** | [TypeScript](https://www.typescriptlang.org/) | Type-safe development |
| **Penyimpanan Lokal** | [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | Token sesi, tema, & preferensi IP |
| **Backend Framework** | [Laravel 12](https://laravel.com/) | RESTful API Engine |
| **Autentikasi** | [Laravel Sanctum](https://laravel.com/docs/sanctum) | Bearer token authentication |
| **Database** | SQLite / MySQL | Penyimpanan relasional data transaksi & user |
| **PDF Engine** | Expo Print & Expo Sharing | Ekspor laporan PDF native & web |

---

## 📂 Struktur Proyek

```plaintext
catatan-keuangan/
├── app/                      # Expo Router Pages
│   ├── (app)/                # Halaman Aplikasi Terproteksi
│   │   ├── index.tsx         # Dashboard utama & Saldo
│   │   ├── transaksi.tsx     # Form tambah & edit transaksi
│   │   ├── riwayat.tsx       # Riwayat transaksi + Modal Kalender
│   │   ├── laporan.tsx       # Rekap analisis & Ekspor PDF
│   │   └── _layout.tsx       # Tab bar navigation & Theme toggle
│   ├── (auth)/               # Halaman Autentikasi
│   │   ├── login.tsx         # Halaman Masuk
│   │   ├── register.tsx      # Halaman Pendaftaran
│   │   └── forgot-password.tsx # Reset Password teranimasi
│   ├── admin/                # Halaman Panel Admin
│   │   ├── index.tsx         # Dashboard statistik admin & Atur IP
│   │   └── user/[uid].tsx    # Detail transaksi per user
│   └── _layout.tsx           # Root provider (Theme & Auth)
├── components/               # Komponen UI Reusable
│   ├── CalendarModal.tsx     # Modal Kalender & Lompat Bulan
│   ├── ServerConfigModal.tsx # Modal Konfigurasi IP Publik & Admin
│   ├── ThemeToggle.tsx       # Switcher animasi mode gelap/terang
│   └── ui.tsx                # Card, Button, Input, Chip, Badge
├── constants/                # Tema & Kategori
│   ├── categories.ts         # Konfigurasi kategori transaksi
│   └── theme.ts              # Palet warna Light & Dark mode
├── contexts/                 # React Context State
│   ├── AuthContext.tsx       # Manajemen sesi pengguna
│   └── ThemeContext.tsx      # Manajemen tema & animasi transisi
├── services/                 # Jaringan & API
│   └── api.ts                # HTTP Client fetch dengan dual-IP routing
└── vercel.json               # Konfigurasi Deploy Web ke Vercel
```

---

## 🚀 Cara Menjalankan

### 1. Menjalankan Backend (Laravel API)
Pastikan PHP (>= 8.2) dan Composer sudah terinstal di komputer kamu.

```bash
cd catatan-keuangan-api

# Install dependensi (jika baru pertama kali)
composer install

# Jalankan migrasi database
php artisan migrate

# Jalankan server API (Port 8000 untuk Publik)
php artisan serve --host=0.0.0.0 --port=8000

# (Opsional) Jalankan server API khusus Admin di Port 8001
php artisan serve --host=0.0.0.0 --port=8001
```

### 2. Menjalankan Frontend (Expo App)

```bash
cd catatan-keuangan

# Install dependensi
npm install

# Menjalankan di Web Browser
npm run web

# Menjalankan di HP (Expo Go)
npm start
```
> 💡 *Scan QR code yang muncul di terminal menggunakan aplikasi **Expo Go** di ponsel kamu.*

---

## ☁️ Deploy ke Vercel

Proyek ini telah dikonfigurasi secara optimal untuk di-deploy ke **Vercel** sebagai Single Page Application (SPA).

1. Push kode terbaru ke GitHub repository kamu.
2. Masuk ke dashboard **[Vercel](https://vercel.com)** lalu klik **"Add New Project"**.
3. Hubungkan repository `CatatanKeuangan`.
4. Vercel akan secara otomatis mendeteksi pengaturan dari [`vercel.json`](file:///c:/Users/JerichoNS/Downloads/ABDM/Compressed/catatan-keuangan/vercel.json):
   - **Build Command**: `npx expo export -p web`
   - **Output Directory**: `dist`
5. Klik **Deploy** dan aplikasi web siap diakses secara publik!

---

## 🔒 Keamanan & Akun Admin

- Setiap request yang memerlukan autentikasi dilindungi token **Laravel Sanctum**.
- Endpoint admin (`/api/admin/*`) diverifikasi secara ketat berdasarkan status `is_admin = true`.
- Akun non-admin yang mencoba mengakses panel admin akan otomatis dialihkan dan ditolak oleh backend (`403 Forbidden`).

---

## 👨‍💻 Kontributor & Lisensi

Dibuat dengan ❤️ oleh **[JerichoNs](https://github.com/JerichoNs)**.  
Didistribusikan di bawah lisensi **MIT**. Silakan gunakan, pelajari, dan kembangkan sesuai kebutuhan.
