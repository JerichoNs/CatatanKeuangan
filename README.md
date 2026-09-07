<div align="center">

# 💰 Catatan Keuangan

### *Aplikasi pencatat pemasukan dan pengeluaran harian berbasis React Native & Laravel API*

![React Native](https://img.shields.io/badge/React_Native-0.86.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-SDK_57-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Ready-000000?style=for-the-badge&logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<br />

**Catatan Keuangan** adalah aplikasi pelacak arus kas pribadi yang dibangun menggunakan **Expo (React Native)** untuk antarmuka pengguna dan **Laravel 12 (Sanctum API)** untuk backend. Aplikasi ini dapat berjalan lintas platform (Android, iOS, dan Web) dengan fokus pada kemudahan input data, tampilan yang bersih, dan navigasi yang cepat.

[Fitur Utama](#-fitur-utama) • [Teknologi](#-teknologi--stack) • [Struktur Folder](#-struktur-folder) • [Cara Menjalankan](#-cara-menjalankan) • [Deploy ke Vercel](#-deploy-ke-vercel)

</div>

---

## ✨ Fitur Utama

### 🌙 Mode Gelap & Terang (Smooth Transition)
- **Pergantian Warna Halus**: Transisi antara mode gelap dan terang dibuat mengalir dengan animasi bertahap agar tidak menyilaukan mata saat berganti tema.
- **Tombol Switch Interaktif**: Dilengkapi tombol geser responsif dengan animasi rotasi dan *cross-fade* ikon matahari dan bulan.
- **Tersimpan Otomatis**: Pilihan tema tersimpan di memori lokal (`AsyncStorage`) sehingga tetap aktif saat aplikasi dibuka kembali.

### 📅 Kalender Interaktif di Riwayat
- **Lompat Cepat ke Bulan & Tahun**: Bisa langsung memilih bulan dan tahun yang diinginkan tanpa harus klik tombol panah satu per satu.
- **Tampilan Tanggal Lengkap (1–31)**: Kalender visual memudahkan peninjauan aktivitas keuangan harian.
- **Titik Indikator Transaksi**: Tanggal yang memiliki transaksi ditandai dengan titik hijau (pemasukan) dan merah (pengeluaran).
- **Filter Fleksibel**: Memungkinkan kamu melihat transaksi pada tanggal tertentu atau meninjau seluruh bulan sekaligus.

### 📊 Dashboard & Analisis Saldo
- **Kartu Ringkasan Saldo**: Informasi saldo bersih, total pemasukan, dan total pengeluaran tersaji jelas di bagian atas.
- **Bar Rasio Arus Kas**: Grafik perbandingan visual untuk melihat persentase uang yang masuk berbanding uang yang keluar.
- **Tombol Opsi & Reset**: Memudahkan kamu untuk menyegarkan data, mengubah preferensi tema, atau membersihkan data transaksi jika ingin memulai catatan baru.
- **Kategori Beragam**: Tersedia kategori umum seperti makanan, transportasi, belanja, hiburan, gaji, dan lainnya lengkap dengan ikon pendukung.

### 📑 Laporan Bulanan & Ekspor PDF
- **Rekap Arus Kas**: Menampilkan evaluasi apakah keuangan bulan berjalan mengalami **Surplus** atau **Defisit**.
- **Grafik Pengeluaran per Kategori**: Membantu melihat pos pengeluaran mana yang memakan porsi anggaran paling besar.
- **Cetak Dokumen PDF**: Rekap transaksi bulanan dapat langsung dicetak atau disimpan ke file PDF, baik lewat browser komputer maupun dibagikan lewat ponsel.

### 🛡️ Panel Khusus Admin
- **Akses Terproteksi**: Hanya akun dengan status admin (`is_admin = true`) yang dapat masuk ke panel admin.
- **Statistik Sistem**: Menyajikan data total pengguna terdaftar, jumlah transaksi keseluruhan, dan akumulasi volume dana.
- **Rincian Pengguna**: Admin dapat melihat daftar pengguna beserta riwayat transaksi detail masing-masing akun.
- **Pengaturan IP Server**: Fitur konfigurasi IP publik dan admin yang hanya muncul dan dapat dikelola oleh akun Admin.

---

## 🛠️ Teknologi & Stack

| Bagian | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Frontend** | [React Native](https://reactnative.dev/) / [Expo SDK 57](https://expo.dev/) | Mendukung Android, iOS, dan Web |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) | Navigasi berbasis struktur file |
| **Bahasa** | [TypeScript](https://www.typescriptlang.org/) | Menjaga kode tetap aman dan terstruktur |
| **Backend** | [Laravel 12](https://laravel.com/) | RESTful API engine |
| **Autentikasi** | [Laravel Sanctum](https://laravel.com/docs/sanctum) | Autentikasi berbasis Bearer Token |
| **Database** | SQLite / MySQL | Penyimpanan data pengguna dan transaksi |
| **Penyimpanan Lokal** | [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | Menyimpan token sesi dan preferensi tema |
| **PDF** | Expo Print & Expo Sharing | Menangani cetak dan ekspor file PDF |

---

## 📂 Struktur Folder

```plaintext
catatan-keuangan/
├── app/                        # Halaman aplikasi (Expo Router)
│   ├── (app)/                  # Area utama aplikasi
│   │   ├── index.tsx           # Dashboard, saldo, & tombol reset
│   │   ├── transaksi.tsx       # Form pencatatan transaksi
│   │   ├── riwayat.tsx         # Riwayat transaksi + modal kalender
│   │   ├── laporan.tsx         # Analisis grafik & ekspor PDF
│   │   └── _layout.tsx         # Navigasi tab bar & toggle tema
│   ├── (auth)/                 # Area autentikasi
│   │   ├── login.tsx           # Halaman masuk
│   │   ├── register.tsx        # Halaman pendaftaran
│   │   └── forgot-password.tsx # Halaman reset password teranimasi
│   ├── admin/                  # Area panel admin
│   │   ├── index.tsx           # Dashboard data admin & pengaturan IP
│   │   └── user/[uid].tsx      # Detail transaksi per pengguna
│   └── _layout.tsx             # Root layout & tema global
├── components/                 # Komponen antarmuka yang digunakan ulang
│   ├── CalendarModal.tsx       # Modal pemilih kalender dan bulan
│   ├── ServerConfigModal.tsx   # Modal pengaturan IP server
│   ├── ThemeToggle.tsx         # Tombol animasi ganti tema
│   └── ui.tsx                  # Card, Button, Input, Chip, Badge
├── constants/                  # Konfigurasi data statis
│   ├── categories.ts           # Daftar ikon & kategori transaksi
│   └── theme.ts                # Variabel warna mode terang & gelap
├── contexts/                   # Pengelola state aplikasi
│   ├── AuthContext.tsx         # State autentikasi & sesi login
│   └── ThemeContext.tsx        # State tema & animasi transisi
├── services/                   # Penghubung jaringan
│   └── api.ts                  # HTTP client untuk memanggil endpoint API
└── vercel.json                 # Konfigurasi deployment web Vercel
```

---

## 🚀 Cara Menjalankan

### 1. Menjalankan Backend (Laravel API)
Pastikan PHP (minimal versi 8.2) dan Composer sudah terpasang di komputermu:

```bash
cd catatan-keuangan-api

# Pasang paket dependensi
composer install

# Jalankan migrasi database
php artisan migrate

# Jalankan server API (Port 8000)
php artisan serve --host=0.0.0.0 --port=8000
```

*(Opsional)* Jika ingin menjalankan server khusus admin secara terpisah di port 8001:
```bash
php artisan serve --host=0.0.0.0 --port=8001
```

### 2. Menjalankan Frontend (Expo)
Buka terminal baru pada folder aplikasi:

```bash
cd catatan-keuangan

# Pasang dependensi npm
npm install

# Menjalankan versi Web
npm run web

# Menjalankan untuk ponsel (Expo Go)
npm start
```
> *Pindai QR code yang tampil di terminal menggunakan aplikasi **Expo Go** pada ponsel Android atau kamera iPhone.*

---

## ☁️ Deploy ke Vercel

Proyek ini sudah dilengkapi konfigurasi siap pakai untuk Vercel:

1. Unggah kode ke repository GitHub kamu.
2. Masuk ke dashboard **[Vercel](https://vercel.com)** lalu pilih **Add New Project**.
3. Hubungkan repository ini.
4. Vercel akan otomatis mengenali pengaturan dari file `vercel.json`:
   - **Build Command**: `npx expo export -p web`
   - **Output Directory**: `dist`
5. Klik **Deploy**, dan web aplikasi kamu akan langsung aktif secara online.

---

## 📌 Pengaturan Hak Akses Admin

Akun admin bawaan yang sudah siap digunakan:
- **Akun Utama (info.thanael)**: `info.thanael@gmail.com` / `admin12345` (Admin aktif)
- **Akun Master Admin**: `admin@catatankeuangan.com` / `admin12345` (Admin aktif)

Sistem juga secara otomatis mendeteksi email dengan awalan `info.thanael` atau domain admin saat registrasi/login dan langsung memberikan hak akses admin (`is_admin: true`).

Untuk mengaktifkan hak akses admin manual pada akun lain, jalankan perintah berikut di terminal backend:

```bash
php artisan tinker --execute="App\Models\User::where('email', 'email_kamu@domain.com')->update(['is_admin' => true]);"
```

Setelah itu, lakukan logout dan login kembali pada aplikasi. Banner emas admin akan otomatis tampil di halaman Dashboard.

---

## 👨‍💻 Pengembang & Lisensi

Dikembangkan oleh **[JerichoNs](https://github.com/JerichoNs)**.  
Proyek ini bersifat terbuka di bawah lisensi **MIT**. Silakan digunakan dan dikembangkan sesuai kebutuhan.
