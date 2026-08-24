---
name: Aninda Payu
description: Buku kas kertas untuk toko batik — angka ditulis dengan tinta, bukan dihias.
colors:
  primary: "#24518E"
  primary-deep: "#24406B"
  paper: "#F4F1E9"
  paper-lift: "#FAF8F0"
  ink: "#1C2B36"
  ink-muted: "#57626E"
  ruling: "#B9CFDF"
  line-paper: "#D8D2C4"
  line-input: "#BFB8A6"
  secondary: "#EAE4D6"
  muted: "#ECE7DA"
  soga: "#9C4A1F"
  pencil-red: "#B3372B"
  pencil-green: "#2E6B4F"
typography:
  display:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontWeight: 700
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontWeight: 400
rounded:
  sm: "2px"
  md: "3px"
  lg: "4px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper-lift}"
    rounded: "{rounded.md}"
    height: "32px"
    padding: "0 10px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "32px"
    padding: "0 10px"
  button-destructive:
    backgroundColor: "transparent"
    textColor: "{colors.pencil-red}"
    rounded: "{rounded.md}"
    height: "32px"
    padding: "0 10px"
  input-field:
    backgroundColor: "{colors.paper-lift}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "36px"
    padding: "0 10px"
  badge-stamp:
    backgroundColor: "transparent"
    textColor: "{colors.pencil-red}"
    rounded: "{rounded.sm}"
    height: "20px"
    padding: "0 8px"
---

# Design System: Aninda Payu

## Overview

**Creative North Star: "Buku Kas" — buku ledger kertas di meja toko batik.**

Aplikasi ini diperlakukan sebagai buku, bukan dashboard. Setiap layar adalah
halaman buku: kertas tulang hangat, tinta biru-hitam, garis ruling biru pudar
seperti buku tulis, dan pensil merah yang hanya muncul untuk selisih, stok
menipis, dan total akhir. Ekspresi datang dari detail pembukuan — garis ganda
di bawah judul, garis merah ganda di bawah total — bukan dari dekorasi.

Kepadatan sedang, tenang, dan fungsional: pemilik membuka buku dengan satu
tangan di toko, membaca angka hari ini, memilih aksi dari indeks, mencatat,
lalu menutup buku. Tidak ada kartu metric, tidak ada gradasi, tidak ada
bayangan: kedalaman dinyatakan dengan garis, bukan cahaya.

**Key Characteristics:**
- Kertas hangat (#F4F1E9) sebagai satu-satunya latar; tidak ada putih murni.
- Garis ruling biru pudar (#B9CFDF) memisahkan baris seperti buku tulis.
- Garis ganda indigo untuk kepala buku; garis ganda pensil merah untuk total.
- Radius sudut ≤4px; border 1px; nol bayangan, nol gradien, nol glass.
- Angka selalu tabular; pensil merah untuk negatif; soga untuk aksen aktif.
- Ikon SVG authored bergoresan pena persegi; bukan pustaka ikon generik.

## Colors

Palet tinta toko: satu indigo kerja, satu cokelat soga batik, dua pensil
(merah/hijau), dan keluarga kertas netral hangat.

### Primary
- **Indigo Tinta** (#24518E): aksi utama, tautan, nav aktif, fokus keyboard. Satu-satunya warna "tombol".
- **Indigo Dalam** (#24406B): hover tombol primer, garis kepala buku, overlay dialog.

### Secondary
- **Soga Batik** (#9C4A1F): aksen kecil bernyawa — garis bawah nav aktif, peringatan hati-hati, caret teks. Jarang dan sengaja.

### Tertiary
- **Pensil Merah** (#B3372B): selisih negatif, stok menipis, total akhir, error.
- **Pensil Hijau** (#2E6B4F): selisih positif, keadaan aman/selesai.

### Neutral
- **Kertas Tulang** (#F4F1E9): latar aplikasi.
- **Kertas Terang** (#FAF8F0): permukaan kartu, popover, input.
- **Kertas Redup** (#ECE7DA) / **Kertas Kedua** (#EAE4D6): hover baris, secondary.
- **Tinta** (#1C2B36): teks utama.
- **Tinta Pudar** (#57626E): teks sekunder (≥4.5:1 di atas kertas).
- **Garis Ruling** (#B9CFDF): pemisah baris tabel/daftar.
- **Garis Kertas** (#D8D2C4): border kartu/komponen; **Garis Input** (#BFB8A6): border medan isian.

### Named Rules
**The Red Pencil Rule.** Pensil merah hanya untuk angka yang butuh perhatian
(negatif, menipis, total). Memakainya untuk dekorasi menghapus artinya.
**The One Ink Rule.** Satu indigo untuk semua aksi; soga hanya aksen garis,
tidak pernah mengisi permukaan besar.

## Typography

**Display Font:** Bricolage Grotesque (dengan fallback system-ui sans)
**Body Font:** Public Sans (dengan fallback system-ui sans)

**Character:** display grotesque berdada lebar seperti huruf sampul buku
tulis; body sans netral dan rapi untuk angka dan formulir.

### Hierarchy
- **Display** (700, 1.875rem, 1.2): nama buku "Aninda Payu" di Beranda dan login.
- **Headline** (700, 1.5rem, 1.3): judul halaman (h1) dengan garis tinta tunggal di bawah.
- **Title** (600, 1.125rem, 1.4): judul seksi (h2) seperti "Aksi cepat".
- **Body** (400, 0.875–1rem, 1.5): teks umum dan isi tabel; measure ≤75ch.
- **Label** (600, 0.75rem, +0.05em, UPPERCASE): kepala kolom tabel.

### Named Rules
**The Tabular Rule.** Semua kolom angka memakai `font-variant-numeric: tabular-nums`; angka harus sejajar vertikal seperti ditulis di kolom buku.

## Layout

Mobile-first satu kolom (max-w-2xl di Beranda), sidebar indeks muncul di ≥768px
dan bottom nav tetap di mobile. Irama spasi longgar antar seksi (32px), rapat
di dalam kelompok (8px). Kepala halaman selalu: judul + garis tinta tunggal;
kepala buku (Beranda/login): judul tengah + garis ganda indigo.

## Elevation & Depth

Sistem ini **tanpa bayangan sama sekali**. Kedalaman dan pemisahan dinyatakan
dengan garis: border 1px untuk wadah, ruling biru untuk baris, garis ganda
untuk kepala, garis merah ganda untuk total. Overlay dialog memakai tinta
indigo 40% tanpa blur.

### Named Rules
**The Flat-By-Default Rule.** Nol `box-shadow` di seluruh permukaan; jika
sebuah elemen butuh "terangkat", beri border, bukan bayangan.

## Shapes

Sudut hampir persegi: 2px (badge/stamp), 3px (tombol/input), 4px (kartu/dialog).
Border 1px di mana wadah butuh batas; tidak ada pill, tidak ada lingkaran
dekoratif, tidak ada clipping organik.

## Components

### Buttons
- **Shape:** persegi 3px radius, tinggi 32px (40px untuk CTA formulir besar).
- **Primary:** indigo tinta penuh, teks kertas terang; hover → indigo dalam; aktif turun 1px.
- **Outline:** transparan, border tinta 30%; hover → kertas redup.
- **Secondary:** kertas kedua dengan border garis kertas.
- **Destructive:** transparan, teks + border pensil merah; hover isi merah 10%.

### Badges (Stamp)
- **Style:** persegi 2px, tinggi 20px; varian destructive = teks pensil merah
  dengan border merah 50% tanpa isi, seperti cap koreksi di buku.

### Cards / Containers
- **Corner Style:** 4px. **Background:** kertas terang. **Border:** 1px garis
  kertas. **Shadow:** tidak ada. **Padding:** 16px.

### Inputs / Fields
- **Style:** border 1px garis input, latar kertas terang, radius 3px, tinggi 36px.
- **Focus:** border indigo + ring indigo 40%; caret soga.
- **Error:** border pensil merah; pesan error ditulis pensil merah dengan langkah pemulihan.

### Navigation
- **Mobile:** bottom bar kertas dengan garis atas indigo 2px; item teks kecil;
  aktif = indigo semibold + goresan bawah soga 2px.
- **Desktop:** sidebar indeks dengan kepala buku bergaris ganda; aktif =
  indigo + underline soga; tombol "Keluar" outline di bawah.

### Ledger Table (signature)
- Kepala kolom label uppercase kecil tinta pudar; bawah kepala = garis ganda
  indigo; antar baris = ruling biru 1px; `tfoot` = garis ganda pensil merah.

### Index Row (signature)
- Baris aksi penuh lebar dipisah ruling biru; nama kiri, panah goresan tangan
  kanan yang bergeser halus saat hover.

## Do's and Don'ts

### Do:
- **Do** tulis angka dengan tabular nums dan format `Rp 150.000`.
- **Do** pakai garis ganda indigo untuk kepala buku dan garis ganda merah hanya untuk total.
- **Do** tandai keadaan aktif dengan goresan soga, bukan isi warna.
- **Do** tema semua permukaan browser: selection indigo, caret soga, scrollbar garis input, `color-scheme: light`.
- **Do** jaga kontras teks ≥4.5:1 di atas kertas.

### Don't:
- **Don't** pakai bayangan, gradien, glass, atau blur dekoratif — dunia ini datar dan bertinta.
- **Don't** pakai putih murni atau abu-abu dingin; netral selalu bernuansa kertas hangat.
- **Don't** pakai ikon pustaka generik atau emoji; ikon adalah SVG authored goresan pena.
- **Don't** bulatkan sudut di atas 4px; pill hanya untuk kontrol kecil bila terpaksa.
- **Don't** pakai pensil merah untuk dekorasi; ia milik selisih dan peringatan.
