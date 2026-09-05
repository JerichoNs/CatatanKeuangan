# Catatan Keuangan

Aplikasi monitoring pemasukan & pengeluaran pribadi. Satu codebase Expo buat iOS (termasuk iPad), Android, dan web, plus panel admin buat pantau semua user.

## Progress sejauh ini

- **Selesai - Autentikasi**: Daftar akun, login, logout, reset password. Firebase Auth.
- **Selesai - Dashboard**: Ringkasan saldo, grafik pemasukan vs pengeluaran, transaksi terbaru. Connect ke Firestore beneran.
- **Selesai - Fase 2 (Catat Transaksi)**: Form tambah pemasukan/pengeluaran, pilih kategori, tanggal, catatan opsional. Bisa edit & hapus transaksi yang udah ada.
- **Selesai - Fase 3 (Riwayat Transaksi)**: List semua transaksi, filter per bulan (panah kiri/kanan), filter per kategori (chip), tap transaksi buat langsung edit.
- **Selesai - Fase 4 (Laporan Bulanan)**: Rekap otomatis (total pemasukan/pengeluaran/saldo bersih per bulan), grafik batang pengeluaran per kategori, ekspor laporan ke PDF.
- **Selesai - Panel Admin**: Statistik umum (total pengguna, total transaksi, transaksi bulan ini, total volume), daftar pengguna dengan jumlah transaksi masing-masing, tap salah satu buat lihat detail transaksi mereka (read-only, admin nggak bisa edit/hapus punya user lain).
- **Selesai - App icon & splash screen**: udah diganti, nggak pakai default Expo lagi (lihat bagian "Branding" di bawah).
- **Selesai - Privacy policy**: draft lengkap di `legal/`, tinggal isi tanggal & kontak.
- **Selesai - Robustness pass**: penanganan error yang proper (bukan cuma diem kalau Firestore gagal), accessibility labels, unit test, dan CI otomatis (lihat bagian "Kualitas & Reliability" di bawah).

Soal warna: biru (`#2B5CE6`) jadi warna utama, kuning (`#FFC145`) jadi aksen buat highlight/CTA/badge. Khusus indikator pemasukan/pengeluaran tetap pakai hijau/merah - itu konvensi paling gampang dikenali orang di aplikasi finance, biar nggak salah baca angka.

Catatan lain: gambar roadmap yang kamu kirim itu isinya rencana fitur per fase (semacam sitemap), bukan mockup visual (warna/layout). Jadi tampilan yang kepakai sekarang aku desain sendiri berdasarkan itu, dengan warna biru/kuning yang kamu minta.

## Update UI/UX

Desain awal kesannya generic banget (form kotak-kotak polos, card flat tanpa depth) - udah aku upgrade:

- Card, tombol, dan input sekarang punya shadow/depth (lewat komponen `Card`, `Button`, `InputField` di `components/ui.tsx`), bukan kotak bordered polos
- Card saldo di Dashboard pakai gradient (`expo-linear-gradient`), bukan warna solid flat
- Icon ditambahin di input field, tombol, empty state, dan tiap item transaksi (pakai `@expo/vector-icons`)
- Login/Register punya badge icon di atas, bukan cuma judul teks polos

Soal platform & orientasi (ini beberapa hal yang tadinya belum bener, udah dibenerin):

- **Landscape**: sebelumnya `orientation` di `app.json` ke-lock `"portrait"`, jadi landscape kepotong paksa - udah diubah ke `"default"` (ngikutin device, termasuk landscape di iPad)
- **Web/laptop**: konten (form, dashboard, dll) sekarang dibatasi `maxWidth` dan center di layar lebar, jadi nggak keliatan stretch aneh kayak mobile view yang dipaksa full-width di browser desktop
- **Panel Admin di HP**: `/admin` itu route biasa yang nggak dibatasi platform tertentu, jadi otomatis bisa diakses dari HP, iPad, atau web selama akun-nya `isAdmin: true` - nggak perlu setup tambahan

Semua ini udah aku build ulang & test (`tsc --noEmit` + `expo export -p web`) di sandbox, bersih tanpa error.

## Cara jalanin

`package.json` di folder ini bukan ditulis manual - aku beneran install & build project-nya di sandbox (Expo SDK 57) buat mastiin semua versi dependency cocok satu sama lain sebelum dikasih ke kamu.

### 1. Install dependency

```bash
cd catatan-keuangan
npm install --legacy-peer-deps
```

Flag `--legacy-peer-deps` wajib - ada konflik peer dependency antara `expo-router` (lewat paket `@expo/ui`-nya) sama React 19 yang belum sepenuhnya rapi di ekosistem itu. Nggak masalah, itu cuma soal resolusi versi, bukan bug di kode.

### 2. Setup Firebase

1. Buat project baru di [Firebase Console](https://console.firebase.google.com)
2. **Authentication** -> Sign-in method -> aktifin **Email/Password**
3. **Firestore Database** -> Create database (mode production)
4. Di **Project Settings** -> **General**, scroll ke "Your apps" -> tambah Web app -> copy config-nya
5. Paste config itu ke `services/firebase.ts`, ganti semua yang tulisannya `GANTI...`
6. Di tab **Rules** Firestore, paste isi `firestore.rules` dari folder ini, lalu Publish

### 3. Jalanin di localhost (web)

```bash
npx expo start --web
```

Otomatis buka `http://localhost:8081` di browser. Kalau port itu kepakai, Expo pindah ke port lain otomatis dan kasih tau di terminal. Ini udah aku test beneran - server-nya aku nyalain dan `curl http://localhost:8081` balikin HTTP 200 dengan halaman ke-render, jadi bukan cuma dugaan.

### 4. Jalanin di HP/iPad

```bash
npx expo start
```

Scan QR code yang muncul pakai app **Expo Go** (App Store/Play Store) - HP/iPad harus satu WiFi sama laptop. Buat iOS simulator (butuh Mac + Xcode): `npx expo start --ios`.

### 5. Bikin akun admin

Register akun biasa dulu dari app, terus buka Firestore Console -> koleksi `users` -> cari dokumen sesuai UID akun itu -> ubah field `isAdmin` jadi `true`. Setelah itu banner "Buka Panel Admin" bakal muncul di Dashboard akun tersebut.

## Hal-hal yang mungkin kelihatan aneh tapi normal

- **`// @ts-ignore` di `services/firebase.ts`**: ada satu import (`getReactNativePersistence`) yang type declaration-nya emang belum lengkap dari sisi Firebase sendiri - ini known issue lama di firebase-js-sdk, fungsinya tetap jalan normal di runtime, cuma TypeScript-nya yang "salah baca". Aman diabaikan.
- **Warning peer dependency pas `npm install`**: sama kayak poin di atas, soal `expo-router`/`@expo/ui` vs React 19. Bukan error, project tetap jalan.
- **Kalau ada versi yang bentrok di kemudian hari** (misal kamu nambah package lain): jalanin `npx expo install --fix` buat nyesuain ulang ke versi yang kompatibel sama Expo SDK yang kepasang.

## Detail Fase 2-4

**Catat Transaksi** (`app/(app)/transaksi.tsx`) - satu form dipakai buat tambah DAN edit. Kalau dibuka lewat tombol "+" di tab bar, mode tambah baru. Kalau dibuka dari Riwayat/Dashboard (tap salah satu transaksi), otomatis mode edit + ada tombol Hapus. Kategori beda daftar tergantung tipe (Pemasukan/Pengeluaran) - daftarnya ada di `constants/categories.ts`, tinggal tambah/ubah array di situ kalau mau kategori lain.

**Riwayat Transaksi** (`app/(app)/riwayat.tsx`) - filter bulan geser pakai panah, filter kategori otomatis cuma nampilin kategori yang beneran ada transaksinya di bulan itu. Semua transaksi user diambil sekali lewat `onSnapshot` real-time, filter bulan/kategori dikerjain di sisi klien (bukan query Firestore terpisah) - cukup ringan buat skala personal finance app, nggak perlu index tambahan.

**Laporan Bulanan** (`app/(app)/laporan.tsx`) - rekap & grafik dihitung dari data bulan yang lagi dipilih. Ekspor PDF perilakunya beda per platform (ini normal, bukan bug):
- **iOS/Android**: generate file PDF asli, buka share sheet native (bisa disimpen ke Files/Google Drive/dikirim ke WhatsApp, dst)
- **Web**: `expo-print` di web nggak bisa generate file PDF langsung (keterbatasan library-nya), jadi kepakainya buka tab baru berisi laporan yang udah diformat, terus otomatis munculin dialog print browser - user tinggal pilih "Save as PDF" di situ. Kalau browser blokir pop-up, bakal muncul pesan buat izinin dulu.

**Panel Admin** (`app/admin/index.tsx` + `app/admin/user/[uid].tsx`) - statistik umum dihitung dari SEMUA transaksi & user (query tanpa filter `userId`, cuma bisa jalan karena `firestore.rules` udah ngasih akses baca penuh ke akun `isAdmin: true`). Tap salah satu user di daftar buka halaman detail read-only berisi transaksi mereka - admin cuma bisa lihat, nggak ada tombol edit/hapus di situ sama sekali (baik di UI maupun di rules Firestore-nya).

Catatan skala: query admin ambil SELURUH koleksi `transactions` tanpa batas - cocok buat jumlah user & transaksi skala personal/kelas, tapi kalau nanti user-nya udah ratusan/ribuan dengan transaksi jutaan, sebaiknya diganti ke pola aggregate counter (Cloud Function yang update dokumen ringkasan tiap ada transaksi baru) daripada baca semua dokumen tiap buka Panel Admin.

## Branding: App Icon & Splash Screen

Icon & splash udah diganti dari default Expo - desainnya monogram "Rp" putih di atas gradient biru (`#2B5CE6` ke `#16234F`) dengan aksen kuning, dibuat programatik biar konsisten sama palet di dalam app. File-nya ada di `assets/`:

- `icon.png` - icon utama (iOS + fallback umum)
- `android-icon-foreground.png` / `android-icon-background.png` / `android-icon-monochrome.png` - 3 layer buat adaptive icon Android (termasuk versi monokrom buat themed icon Android 13+)
- `splash-icon.png` - logo di splash screen, dikonfigurasi lewat plugin `expo-splash-screen` di `app.json`
- `favicon.png` - dipakai buat versi web (otomatis dikonversi jadi `favicon.ico` pas `expo export`)

Ini baseline yang udah oke buat langsung dipakai, tapi kalau nanti kamu (atau desainer) mau bikin logo yang lebih custom, tinggal timpa file-file itu dengan ukuran yang sama (1024x1024 buat semua kecuali favicon 196x196) - nggak perlu ubah kode apapun.

## Kualitas & Reliability

Beberapa hal ditambahin khusus buat naikin kualitas dari sekadar "jalan" jadi "siap dipakai beneran":

- **Error handling yang proper**: Dashboard, Riwayat, Laporan, dan Panel Admin sekarang nampilin layar error + tombol "Coba lagi" kalau Firestore gagal diakses (misal lagi offline) - sebelumnya kalau gagal, layar cuma diem nampilin saldo Rp0 yang menyesatkan (kelihatan kayak "kamu nggak punya uang" padahal cuma gagal connect).
- **Accessibility**: semua tombol, input, dan chip punya `accessibilityLabel`/`accessibilityRole` yang bener, biar bisa dipakai sama screen reader (VoiceOver/TalkBack) - ini juga salah satu hal yang dicek pas review App Store/Play Store.
- **Unit test**: `__tests__/date.test.ts` dan `__tests__/categories.test.ts`, nutupin fungsi-fungsi penting (perhitungan tanggal, filter bulan, lookup icon kategori). Jalanin dengan:
  ```bash
  npm test
  ```
- **CI otomatis** (`.github/workflows/ci.yml`): begitu kamu push ke GitHub, otomatis jalanin type-check + unit test + coba build web - biar ketauan dari awal kalau ada perubahan yang bikin error, sebelum sempat ke-deploy.

## Fase 2-4 dan heads-up soal Firestore index

Pertama kali buka Dashboard/Riwayat/Laporan, kemungkinan muncul error di console/terminal soal "index" - itu wajar, query-nya (filter per user + urutkan berdasarkan tanggal) butuh composite index. Klik link yang muncul di pesan error itu, tunggu index-nya kebuat beberapa menit di Firebase Console, lalu reload. Query di ketiga layar itu bentuknya sama persis, jadi cukup **satu** index buat semuanya - sekali kebuat, langsung berlaku buat Dashboard, Riwayat, dan Laporan sekaligus.

## Yang masih perlu sebelum beneran publish ke App Store / Play Store

Semua kode (Fase 1-4 + Panel Admin) udah kelar dan ke-icon/splash udah branded. Sisanya ini murni bagian yang cuma bisa kamu sendiri yang kerjain (butuh akun & keputusan milik kamu, nggak bisa dikerjain lewat kode):

- [x] ~~Panel Admin masih stub~~ - selesai, lihat bagian "Detail Fase 2-4" di atas
- [x] ~~App icon & splash screen default~~ - selesai, lihat bagian "Branding" di atas
- [ ] **Isi tanggal & kontak di `legal/privacy-policy.md` / `.html`**, lalu host di suatu tempat yang punya URL publik (Firebase Hosting paling gampang karena udah dipakai buat backend-nya juga) - App Store & Play Store berdua minta URL privacy policy aktif pas submit
- [ ] **Akun developer**: [Apple Developer Program](https://developer.apple.com/programs/) (~$99/tahun) buat iOS, [Google Play Console](https://play.google.com/console/) ($25 sekali bayar) buat Android - ini akun pribadi/organisasi kamu, aku nggak bisa bikinin
- [ ] **Build produksi lewat EAS** - `eas.json` di folder ini udah aku siapin (profile development/preview/production). Langkahnya:
  ```bash
  npm install -g eas-cli
  eas login
  eas build:configure   # generate projectId, nempel ke app.json otomatis
  eas build --platform all --profile production
  ```
- [ ] **Submit ke store**: `eas submit --platform ios` / `eas submit --platform android` (butuh akun developer di atas udah aktif)
- [ ] **Listing di store**: screenshot, deskripsi, kategori, rating konten - ini manual di App Store Connect / Play Console
- [ ] **Review Firestore rules sekali lagi** sebelum data user asli masuk skala besar - rules yang ada sekarang udah aman buat MVP (lihat catatan skala di bagian Panel Admin di atas)

## Next steps kalau mau lanjut ngembangin fitur

- Isi Panel Admin: query lintas-user buat lihat daftar pengguna & transaksi mereka (read-only), statistik umum
- Custom claims lewat Cloud Function buat cek admin, lebih efisien daripada lookup Firestore tiap kali (opsional, nice-to-have)
- Native date picker (`@react-native-community/datetimepicker`) buat gantiin pilihan "Hari ini/Kemarin" kalau butuh pilih tanggal manapun dengan lebih leluasa
- Kategori custom (bikin/hapus kategori sendiri) - sekarang masih daftar tetap di `constants/categories.ts`
#   M o n e y - P l a n  
 