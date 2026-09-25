<div align="center">

<br />

<img src="https://img.shields.io/badge/-%F0%9F%92%B8%20Rekap.id-1a1a2e?style=for-the-badge&labelColor=3B82F6&color=0F172A" alt="Rekap.id" height="42"/>

<h3>Personal Finance Intelligence Platform</h3>
<p><em>Catat. Analisis. Tumbuh. — 100% Gratis, Selamanya.</em></p>

<br />

[![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev)
[![Expo SDK](https://img.shields.io/badge/Expo-SDK_57-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-latest-0055FF?style=flat-square&logo=framer&logoColor=white)](https://framer.com/motion)
[![License MIT](https://img.shields.io/badge/License-MIT-10B981?style=flat-square)](LICENSE)
[![Free Forever](https://img.shields.io/badge/Price-100%25_FREE-10B981?style=flat-square&logo=heart&logoColor=white)](#-support-creator)

<br />

> **Rekap.id** adalah platform keuangan pribadi modern lintas platform (Android · iOS · Web) yang dibangun dengan **Expo React Native** + **Laravel 12 REST API**. Desain terinspirasi estetika premium FintechX dengan animasi scroll Framer Motion, market ticker real-time, dan laporan PDF ekspor — semua **gratis tanpa syarat**.

<br />

[✨ Fitur](#-fitur-utama) · [🛠️ Stack](#️-tech-stack) · [📂 Struktur](#-struktur-folder) · [🚀 Setup](#-cara-menjalankan) · [☁️ Deploy](#️-deploy) · [❤️ Support](#-support-creator)

</div>

---

## ✨ Fitur Utama

<table>
<tr>
<td width="50%">

### 📈 Market Intelligence
- **Market Ticker Real-Time** — IHSG, USD/IDR, EUR/IDR, SGD/IDR, JPY/IDR, Emas Antam
- Badge fluktuasi naik/turun dengan warna dinamis
- Auto-refresh setiap interval terkonfigurasi

### 🏦 Dashboard Finansial
- **KPI Cards** — Saldo bersih, pemasukan bulanan, pengeluaran harian
- **Rasio Arus Kas** — Progress bar Surplus vs Defisit visual
- Tombol aksi cepat: catat, transfer, rekap

### 🗓️ Kalender Transaksi
- Navigasi bulan & tahun fleksibel
- Titik indikator hijau (masuk) & merah (keluar) per tanggal
- Ringkasan per-periode langsung dari kalender

</td>
<td width="50%">

### 🎨 Desain Premium
- **Landing page** bergaya FintechX dengan animasi Framer Motion
- **Scroll-triggered animations** — fade-up, slide, scale-in
- Dark mode / Light mode dengan transisi mulus
- Ambient nebula glow background
- Font premium: Bricolage Grotesque + Inter

### 📑 Laporan & Ekspor PDF
- Grafik kategori pengeluaran terbesar
- Ekspor langsung format **kertas A4** standar
- Auto-hide navigasi saat mode cetak

### 🛡️ Panel Administrator
- Akses terisolasi (`is_admin = true`)
- Monitoring seluruh akun & volume dana sistem
- Konfigurasi URL API server dari dalam aplikasi

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

| Layer | Teknologi | Versi |
|:---|:---|:---|
| **UI Framework** | React Native via Expo | SDK 57 |
| **Language** | TypeScript | 6.0 |
| **Navigation** | Expo Router (file-based) | v4 |
| **Animations** | Framer Motion (web) + React Native Animated | latest |
| **Backend API** | Laravel + Laravel Sanctum (Bearer Token) | 12.x |
| **Database** | SQLite → migratable ke MySQL/PostgreSQL | — |
| **Cloud Hosting** | Railway (API) + Vercel (Web) | — |
| **Local Storage** | AsyncStorage (token, tema, URL API) | — |
| **PDF Export** | Expo Print + Expo Sharing | — |

**API Produksi aktif:** `https://catatan-keuangan-api-production.up.railway.app/api`

---

## 📂 Struktur Folder

```
rekap.id (catatan-keuangan)/
│
├── app/                            # Halaman Expo Router
│   ├── landing.tsx                 # 🌟 Landing page FintechX-style
│   ├── (app)/
│   │   ├── index.tsx               # Dashboard utama + KPI cards
│   │   ├── transaksi.tsx           # Form input transaksi
│   │   ├── riwayat.tsx             # Riwayat + filter kalender
│   │   ├── laporan.tsx             # Rekap analitik + ekspor PDF
│   │   └── _layout.tsx             # Floating tab bar responsif
│   ├── (auth)/
│   │   ├── login.tsx               # Login teranimasi
│   │   ├── register.tsx            # Registrasi akun
│   │   └── forgot-password.tsx     # Pemulihan password
│   ├── admin/
│   │   ├── index.tsx               # Admin dashboard + config server
│   │   └── user/[uid].tsx          # Detail transaksi per user
│   └── _layout.tsx                 # Root layout + providers
│
├── components/
│   ├── MotionView.tsx              # 🎬 Universal Framer Motion wrapper
│   ├── AppAmbientBackground.tsx    # Nebula floating glow particles
│   ├── ScreenTransitionWrapper.tsx # Animasi antar tab
│   ├── CalendarModal.tsx           # Modal kalender interaktif
│   ├── MarketTicker.tsx            # Ticker pasar real-time
│   ├── ServerConfigModal.tsx       # Modal URL server API
│   ├── ThemeToggle.tsx             # Dark/Light mode toggle
│   └── ui.tsx                      # Card, Button, Input, Badge
│
├── constants/
│   ├── theme.ts                    # Skema warna, radius, shadow
│   ├── categories.ts               # Kategori & icon transaksi
│   └── pockets.ts                  # Konfigurasi kantong simpanan
│
├── contexts/
│   ├── AuthContext.tsx             # Sesi user, admin state, demo login
│   └── ThemeContext.tsx            # Global dark/light state
│
├── services/
│   └── api.ts                      # HTTP client + URL server switcher
│
├── types/
│   └── index.ts                    # TypeScript type definitions
│
└── vercel.json                     # Config deploy Vercel
```

---

## 🚀 Cara Menjalankan

### Frontend (Expo — React Native)

```bash
# 1. Clone repositori
git clone https://github.com/JerichoNs/CatatanKeuangan.git
cd CatatanKeuangan

# 2. Install dependensi
npm install

# 3. Jalankan di browser
npm run web

# 4. Jalankan di ponsel (via Expo Go)
npm start
```

> 💡 **Tidak perlu setup backend!** Frontend sudah otomatis terhubung ke API produksi Railway. Langsung `npm run web` dan jalan.

---

### Backend (Laravel API — Opsional)

Jalankan backend sendiri jika ingin development offline:

```bash
cd catatan-keuangan-api

# Install dependensi PHP
composer install

# Setup environment
cp .env.example .env
php artisan key:generate
touch database/database.sqlite

# Migrasi database + seeder admin
php artisan migrate --seed

# Jalankan server lokal
php artisan serve --host=0.0.0.0 --port=8000
```

Setelah backend lokal berjalan, buka **Settings → Server Config** di dalam aplikasi untuk mengganti URL API ke `http://localhost:8000/api`.

---

## 🔐 Akses Administrator

Untuk mengaktifkan hak admin pada akun tertentu, jalankan di terminal backend:

```bash
php artisan tinker --execute="App\Models\User::where('email', 'email@domain.com')->update(['is_admin' => true]);"
```

Login ulang → banner emas **Administrator** otomatis muncul di dashboard.

---

## ☁️ Deploy

### 🌐 Frontend → Vercel

```bash
# File vercel.json sudah terkonfigurasi otomatis
# Build Command: npx expo export -p web
# Output: dist/
```

1. Push ke GitHub
2. Connect repo ke [vercel.com](https://vercel.com)
3. Klik **Deploy** — selesai ✅

### 🚂 Backend → Railway

1. Connect folder API ke [railway.app](https://railway.app)
2. Set start command: `php artisan serve --host 0.0.0.0 --port $PORT`
3. Environment variables:
   ```
   DB_CONNECTION=sqlite
   APP_ENV=production
   APP_KEY=<your-key>
   ```

---

## ❤️ Support Creator

**Rekap.id sepenuhnya gratis dan open source.** Kalau aplikasi ini membantu keuanganmu dan kamu mau traktir developer, boleh banget:

- ☕ **Kopi** — Rp 10.000
- 🍱 **Makan Siang** — Rp 25.000
- 🍣 **Dinner** — Rp 50.000
- 💖 **Donasi Sukarela** via [Saweria](https://saweria.co) / QRIS

> 🙏 *Nggak wajib sama sekali, Rekap.id tetap 100% gratis selamanya. Tapi kalau mau support, makasih banyak bro!*

---

## 📄 Lisensi

```
MIT License — Free to use, modify, and distribute.
```

Dikembangkan dengan ❤️ oleh **[JerichoNs](https://github.com/JerichoNs)**

<div align="center">

<br />

**⭐ Jangan lupa kasih star kalau project ini bermanfaat!**

[![GitHub stars](https://img.shields.io/github/stars/JerichoNs/CatatanKeuangan?style=social)](https://github.com/JerichoNs/CatatanKeuangan)

</div>
