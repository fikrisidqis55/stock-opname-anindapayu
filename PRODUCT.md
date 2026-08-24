# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pemilik toko batik "Aninda Payu" (v1: satu akun owner). Bekerja sendiri dari HP (utama, saat di toko/pasar) dan laptop. Mencatat stok masuk (produksi sendiri & kulakan luar), penjualan (ecer/grosir/kulakan), dan melakukan stock opname fisik berkala.

## Product Purpose

Satu PWA untuk seluruh pembukuan stok toko batik: stok masuk per batch, stok keluar per kanal harga, sesi opname dengan selisih & penyesuaian, dan tiga laporan (stok per babaran, kartu stok, penjualan & laba). Sukses = owner percaya angka stok & laba di aplikasi sama dengan fisik dan buku kasnya.

## Positioning

Ledger sebagai sumber kebenaran: setiap mutasi stok menulis ke `stock_movements`; `stock_qty` hanya denormalisasi. Struktur data siap untuk role tambahan & offline-first, tapi v1 sengaja satu owner dan online.

## Operating Context

Bahasa UI Indonesia dengan istilah domain: Stok, Transaksi, Opname, Laporan, Pengaturan, Ecer, Grosir, Kulakan, Bakul, Produksi Sendiri, Kulakan Luar, jenis babaran (malaman, colet, babar pindo, embos, babar 1). Uang integer rupiah, format `Rp 150.000`. Dipakai satu tangan di HP; input numerik cepat lebih penting daripada dekorasi.

## Capabilities and Constraints

- v1: login 1 owner, CRUD produk (4 harga: modal/ecer/grosir/kulakan, foto), stok masuk per batch, penjualan multi-item dengan nego, sesi opname (satu aktif, autosave, preview selisih, terapkan/batal), 3 laporan, PWA installable.
- Stack terpasang: Next.js 16 App Router, Drizzle + Neon, Auth.js v5, Tailwind v4 + shadcn/ui, zod, UploadThing, Vitest, Playwright.
- Constraint keras: alur & teks tombol yang dipakai E2E tidak boleh berubah (label "Simpan Produk", "Simpan Stok Masuk", "Simpan Penjualan", "Buat Sesi Opname", "Terapkan Penyesuaian", atribut `data-slot` shadcn, `name` field form).
- Open: role admin/kasir, offline-first, ekspor laporan (roadmap, tidak dibangun).

## Brand Commitments

- Nama: Aninda Payu.
- Binding dari user: UI tidak boleh terlihat "vibe coded" — hindari 30 tell di daftar user (harsh gradients, lucide icons, pure white background, rainbow coloring, drop shadows, 3 feature cards, emojis, liquid glass, Inter/Geist/Space Grotesk, colored left stripe, bento grids, terminal window, purple-black, neon, basic pastel, dll.).
- Arah visual terkunci (disetujui user): **"Buku Kas"** — dunia buku kas/ledger toko batik.
- Build path terkunci: comp-first.

## Evidence on Hand

- `docs/design/SPEC.md` (spesifikasi disetujui), `docs/design/PLAN.md` (12 task selesai, terimplementasi & terverifikasi).
- Tidak ada foto produk/aset brand riil selain `public/icons/icon.svg`. Jangan mengarang testimoni/pelanggan/klaim komersial.

## Product Principles

1. Angka harus bisa dipercaya: ledger dulu, denormalisasi kemudian.
2. Satu tangan, satu layar: aksi utama terjangkau jempol, input numerik cepat.
3. Bahasa toko, bukan bahasa software: istilah domain batik & pasar.
4. Tenang tapi berkarakter: alat kerja harian, ekspresi lewat detail ledger (ruling, tinta, pensil merah), bukan dekorasi.

## Accessibility & Inclusion

Kontras teks ≥4.5:1; fokus keyboard terlihat; target sentuh memadai (mobile-first). Bahasa `id`.
