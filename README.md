# Aninda Payu — Aplikasi Stock Opname Batik

Aplikasi web PWA untuk manajemen stok dan stock opname usaha batik **Aninda Payu**. Dirancang mobile-first untuk dipakai langsung di HP, dengan alur:

- **Produk** — katalog batik per kategori jenis babaran (malaman, colet, babar pindo, embos, babar 1), lengkap dengan foto dan 4 harga: modal, ecer, grosir, kulakan.
- **Stok masuk** — produksi sendiri atau kulakan luar, per batch dengan modal aktual; opsi memperbarui harga modal produk ke rata-rata tertimbang.
- **Penjualan** — ecer, grosir, dan kulakan (wajib nama bakul), multi-item, dengan snapshot harga modal untuk menghitung laba.
- **Stock opname** — sesi hitung fisik dengan autosave, pratinjau selisih, lalu penyesuaian stok sekali klik.
- **Laporan** — stok per babaran, kartu stok per produk, dan penjualan & laba per tipe dengan grafik omzet harian.
- **PWA** — dapat dipasang ke home screen HP (manifest + service worker).

Aplikasi single-user (owner), full online.

## Prasyarat

- Node.js 20+
- Database PostgreSQL (mis. [Neon](https://neon.tech))
- Akun [UploadThing](https://uploadthing.com) untuk penyimpanan foto produk

## Setup Lokal

```powershell
npm install
# salin .env.example menjadi .env, lalu isi:
#   DATABASE_URL      - koneksi PostgreSQL (Neon)
#   AUTH_SECRET       - string acak (mis. hasil `openssl rand -hex 32`)
#   UPLOADTHING_TOKEN - token aplikasi UploadThing
#   OWNER_EMAIL       - email login owner
#   OWNER_PASSWORD    - password login owner

npm run db:push   # buat skema database
npm run db:seed   # seed kategori babaran + akun owner
npm run dev       # buka http://localhost:3000
```

## Script Penting

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan |
| `npm run build` / `npm start` | Build & jalankan produksi |
| `npm test` | Unit test (Vitest) |
| `npm run e2e` | E2E alur kritikal (Playwright; butuh dev server & DB aktif) |
| `npm run db:push` | Sinkronkan skema Drizzle ke DB |
| `npm run db:generate` / `db:migrate` | Generate / jalankan migrasi SQL |
| `npm run db:seed` | Seed kategori babaran & akun owner |

## Deploy (Vercel)

1. Impor repo ini ke Vercel.
2. Set environment variable: `DATABASE_URL`, `AUTH_SECRET`, `UPLOADTHING_TOKEN`, `OWNER_EMAIL`, `OWNER_PASSWORD`.
3. Jalankan sekali: `npm run db:migrate` lalu `npm run db:seed` (bisa dari mesin lokal yang menunjuk DB produksi).
4. Setelah deploy, buka aplikasi di HP lalu "Add to Home Screen" untuk pengalaman aplikasi native.

## Dokumentasi Desain

- Spesifikasi: [`docs/design/SPEC.md`](docs/design/SPEC.md)
- Rencana implementasi: [`docs/design/PLAN.md`](docs/design/PLAN.md)
