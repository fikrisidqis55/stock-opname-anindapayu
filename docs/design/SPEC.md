# Spesifikasi: Ananda Payu — Aplikasi Stock Opname Batik

- **Status**: Disetujui
- **Tanggal**: 2026-08-21
- **Platform**: Web PWA (Next.js, responsif, installable di HP)
- **Lokasi proyek**: `ananda-payu/`

---

## 1. Latar Belakang & Tujuan

Ananda Payu adalah toko pakaian batik yang membutuhkan aplikasi untuk:

1. Mencatat **stok masuk** dari dua sumber: **produksi sendiri** dan **kulakan dari luar**.
2. Mencatat **stok keluar** dari tiga kanal penjualan: **ecer**, **grosir**, dan **kulakan/bakul** (pembeli yang borong).
3. Melakukan **stock opname**: penghitungan fisik berkala, perhitungan selisih, penyesuaian stok, dan riwayat sesi.
4. Menyediakan **laporan**: stok per kategori babaran, kartu stok/mutasi, dan penjualan & laba per tipe.

**Tujuan utama**: satu aplikasi PWA yang bisa dipakai dari HP maupun laptop, mudah dipakai satu orang (owner), dengan struktur data yang siap dikembangkan untuk role tambahan (kasir/admin) dan fitur offline di masa depan.

## 2. Ruang Lingkup & Pengguna

### Dalam lingkup (v1)

- Login 1 akun owner (email + password).
- Manajemen produk batik per nama, dikategorikan per **jenis babaran** (malaman, colet, babar pindo, embos, babar 1, dst.), dengan foto produk.
- 4 harga per produk: **modal, ecer, grosir, kulakan**.
- Stok masuk per batch dengan harga modal aktual.
- Penjualan multi-item dengan tipe ecer/grosir/kulakan, harga boleh dinego, nama bakul dicatat saat kulakan.
- Sesi stock opname: snapshot, hitung fisik per produk (bisa dicicil), preview selisih, konfirmasi & penyesuaian, riwayat.
- 3 laporan: stok per babaran, kartu stok/mutasi, penjualan & laba per tipe.
- PWA installable (manifest + ikon + service worker ringan).

### Di luar lingkup (v1), disiapkan fondasinya

- Multi-user aktif (role kasir/admin) — struktur `users.role` sudah ada.
- Multi-cabang/multi-gudang.
- Offline-first + sinkronisasi — lapisan data diisolasi (repository pattern) agar bisa dikembangkan.
- Barcode scanning, cetak label, ekspor laporan (PDF/Excel).

### Pengguna

| Peran | Status v1 | Kemampuan |
|---|---|---|
| Owner | Aktif | Semua fitur |
| Admin / Kasir | Belum aktif | Struktur role tersedia di database |

## 3. Arsitektur

### Stack teknologi

| Komponen | Pilihan |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Database | PostgreSQL (Neon) |
| ORM | Drizzle ORM + drizzle-kit (migrasi) |
| Auth | Auth.js v5, provider credentials (email + password, hash bcrypt) |
| UI | Tailwind CSS + shadcn/ui, desain mobile-first |
| Validasi | Zod (semua input server) |
| File storage | UploadThing (foto produk) |
| PWA | `manifest.ts` + service worker (cache aset statis/app-shell saja) |
| Testing | Vitest (unit), Playwright (E2E) |
| Deploy | Vercel |

### Struktur folder

```
ananda-payu/
├── docs/design/SPEC.md         # dokumen ini
├── src/
│   ├── app/
│   │   ├── (auth)/login/               # halaman login
│   │   ├── (dashboard)/
│   │   │   ├── stok/                   # daftar produk per babaran, detail produk
│   │   │   ├── transaksi/              # penjualan keluar & stok masuk
│   │   │   ├── opname/                 # daftar sesi, sesi aktif, riwayat
│   │   │   ├── laporan/                # stok, kartu stok, penjualan & laba
│   │   │   └── pengaturan/             # kategori babaran, akun
│   │   ├── api/auth/[...nextauth]/     # route Auth.js
│   │   └── manifest.ts                 # PWA manifest
│   ├── server/
│   │   ├── db/                         # skema Drizzle, koneksi, migrasi
│   │   ├── repositories/               # akses data murni per entitas
│   │   └── services/                   # logika bisnis (StockLedger, OpnameEngine, ReportQueries)
│   ├── actions/                        # Server Actions + validasi zod
│   ├── lib/                            # zod schemas, format rupiah/tanggal, konstanta
│   └── components/                     # ui/ (shadcn), layout/, fitur per modul
├── public/                             # ikon PWA
└── tests/                              # unit & e2e
```

### Prinsip arsitektur

1. **Semua mutasi lewat Server Actions** yang tervalidasi zod; tidak ada query DB di komponen UI.
2. **Layering tegas**: komponen UI → `services` → `repositories` → database. Lapisan data bisa diganti (untuk offline-first nanti) tanpa mengubah UI dan logika bisnis.
3. **Ledger sebagai sumber kebenaran riwayat**: setiap perubahan stok menulis baris ke `stock_movements`; kolom `stock_qty` pada produk adalah denormalisasi yang diperbarui dalam transaksi database yang sama.
4. **Invariant stok**: `stock_qty` tidak pernah negatif — divalidasi di service dan dijaga constraint di DB.
5. Semua uang disimpan sebagai **integer rupiah**.

## 4. Model Data

Semua tabel memakai `id` (uuid), `created_at`, dan `updated_at` kecuali dinyatakan lain.

### `users`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| email | text unik | |
| password_hash | text | bcrypt |
| name | text | |
| role | enum `owner` \| `admin` \| `cashier` | default `owner` |

### `categories` (jenis babaran)

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| name | text unik | mis. malaman, colet, babar pindo, embos, babar 1 |

- Seeded awal: **malaman, colet, babar pindo, embos, babar 1**.
- Dapat ditambah/diubah dari menu Pengaturan.

### `products`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| name | text | nama produk |
| category_id | uuid FK → categories | jenis babaran |
| photo_url | text nullable | dari UploadThing |
| price_modal | integer | harga modal |
| price_ecer | integer | harga jual ecer |
| price_grosir | integer | harga jual grosir |
| price_kulakan | integer | harga jual kulakan |
| stock_qty | integer ≥ 0 | stok berjalan (denormalisasi ledger) |
| min_stock_qty | integer nullable | ambang peringatan stok menipis |
| is_active | boolean | produk nonaktif disembunyikan dari transaksi & opname |

Index: `name`, `category_id`.

### `stock_batches` (stok masuk)

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| product_id | uuid FK → products | |
| source | enum `production` \| `purchase` | produksi sendiri / kulakan luar |
| qty | integer > 0 | |
| unit_cost | integer | harga modal aktual per potong |
| total_cost | integer | qty × unit_cost |
| supplier_name | text nullable | asal kulakan luar (opsional) |
| note | text nullable | |
| received_at | timestamptz | |

### `sales` (header transaksi keluar)

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| sale_type | enum `ecer` \| `grosir` \| `kulakan` | |
| customer_name | text nullable | wajib diisi UI bila `kulakan` (nama bakul) |
| total_price | integer | |
| total_cost | integer | snapshot HPP |
| note | text nullable | |
| created_at | timestamptz | |

### `sale_items` (baris item penjualan)

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| sale_id | uuid FK → sales | |
| product_id | uuid FK → products | |
| qty | integer > 0 | |
| unit_price | integer | harga per tipe, boleh di-override (nego) |
| unit_cost_snapshot | integer | `price_modal` produk saat transaksi |
| subtotal | integer | qty × unit_price |

Satu transaksi dapat berisi beberapa produk sekaligus.

### `stock_movements` (kartu stok / ledger)

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| product_id | uuid FK → products | |
| type | enum `in_production` \| `in_purchase` \| `sale` \| `opname_adjust` | |
| qty_change | integer bertanda | + masuk, − keluar |
| ref_type | enum `batch` \| `sale` \| `opname_item` | |
| ref_id | uuid | id baris rujukan |
| note | text nullable | |
| occurred_at | timestamptz | |

Index: `(product_id, occurred_at)`.

### `opname_sessions`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| label | text | default: tanggal (mis. "Opname 21 Agu 2026") |
| status | enum `counting` \| `completed` \| `cancelled` | |
| started_at | timestamptz | |
| completed_at | timestamptz nullable | |
| note | text nullable | |
| total_diff_qty | integer | agregat saat completed |
| total_diff_value | integer | nilai selisih (qty × modal) |

Hanya boleh ada **satu sesi berstatus `counting`** pada satu waktu.

### `opname_items`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| session_id | uuid FK → opname_sessions | |
| product_id | uuid FK → products | |
| system_qty | integer | snapshot stok saat sesi dibuat |
| counted_qty | integer nullable | null = belum dihitung |
| diff_qty | integer computed | counted_qty − system_qty |

Unik: `(session_id, product_id)`. Sesi di-seed dengan semua produk aktif.

## 5. Alur Stock Opname

1. **Buat sesi** — label opsional (default tanggal). Dalam satu transaksi: buat sesi `counting`, seed `opname_items` untuk semua produk aktif dengan `system_qty` snapshot saat itu (`counted_qty` null).
2. **Hitung fisik** — UI mobile-first: produk dikelompokkan per kategori babaran, ada filter/pencarian, input jumlah fisik per produk. Autosave per input; bisa dicicil dan dilanjutkan kapan saja. Tampil progress `x/y terhitung`.
   - Banner peringatan: "Jangan catat penjualan / stok masuk selama opname" karena `system_qty` sudah di-snapshot. Transaksi **tidak dikunci** (keputusan sadar v1).
3. **Preview selisih** — tabel per produk terhitung: stok sistem, hitungan fisik, selisih (−/+ dengan warna), nilai selisih = selisih × `price_modal`.
4. **Konfirmasi & terapkan** — satu transaksi database: untuk setiap item dengan `counted_qty` terisi dan berbeda dari `system_qty`: tulis `stock_movements` (`opname_adjust`, qty bertanda) dan perbarui `products.stock_qty`; set sesi `completed` + agregat `total_diff_qty` dan `total_diff_value`.
   - **Kebijakan produk tidak dihitung**: tidak diubah — hanya item terhitung yang disesuaikan.
5. **Riwayat** — daftar sesi (label, tanggal, status, total selisih qty & nilai) dan detail per produk. Sesi `completed` tidak dapat diedit; pembetulan dilakukan lewat sesi baru.
6. **Batal** — sesi `counting` dapat dibatalkan tanpa penyesuaian (`cancelled`).

## 6. Alur Stok Masuk

1. Pilih produk → sumber: **produksi sendiri** atau **kulakan luar** → qty → harga modal aktual (default `price_modal`, dapat diubah) → nama supplier/asal (opsional, relevan untuk kulakan luar) → catatan opsional.
2. Dalam satu transaksi: buat `stock_batches`, tulis `stock_movements` (`in_production` / `in_purchase`), tambah `products.stock_qty`.
3. Bila `unit_cost` batch berbeda dari `price_modal` produk, muncul opsi: **"Perbarui harga modal produk ke rata-rata tertimbang"** (dihitung dari stok lama × modal lama + qty baru × unit_cost dibagi total qty).

## 7. Alur Penjualan (Stok Keluar)

1. Pilih tipe: **Ecer / Grosir / Kulakan**.
2. Tambah item (bisa multi produk): pilih produk → qty → `unit_price` otomatis mengikuti tipe, **boleh di-override** (nego).
3. Untuk tipe **kulakan**, nama bakul wajib diisi (`customer_name`).
4. Validasi: total qty tiap produk tidak melebihi `stock_qty` saat ini.
5. Dalam satu transaksi: buat `sales` + `sale_items` (dengan `unit_cost_snapshot`), tulis `stock_movements` (`sale`, qty negatif), kurangi `products.stock_qty`.
6. Riwayat transaksi dapat dilihat per tipe dan rentang tanggal.

## 8. Laporan

Semua laporan responsif (HP & desktop), filter rentang tanggal (kecuali stok), tabel + ringkasan.

### 8.1 Stok per kategori babaran
- Kartu per kategori: daftar produk (nama, qty, nilai = qty × price_modal), subtotal per kategori, grand total qty & nilai.
- Badge merah bila `stock_qty` ≤ `min_stock_qty`.
- Posisi stok: per sekarang (tanpa filter tanggal).

### 8.2 Kartu stok / mutasi
- Pilih produk + periode → baris kronologis: tanggal, tipe kejadian (produksi/kulakan luar/penjualan ecer/grosir/kulakan/opname), qty masuk/keluar, **saldo berjalan**.
- Ringkasan periode: total masuk, total keluar, selisih.

### 8.3 Penjualan & laba per tipe
- Pilih periode → tabel per tipe (ecer/grosir/kulakan): jumlah transaksi, total qty, omzet, HPP (dari `unit_cost_snapshot`), laba.
- Ringkasan total semua tipe + grafik batang harian sederhana.

## 9. Auth & Keamanan

- Auth.js v5 provider credentials; sesi berisi `user.id` + `role`.
- Hash password dengan bcrypt; rate limiting dasar pada endpoint login.
- Semua halaman kecuali `/login` dilindungi middleware session.
- Semua Server Action memverifikasi session sebelum eksekusi.
- Validasi zod di setiap input server; error ramah ditampilkan via toast.
- Constraint DB: `stock_qty ≥ 0`, `qty` transaksi > 0.

## 10. PWA & UX

- `manifest.ts` + ikon (192 & 512px), nama "Ananda Payu", installable ke home screen.
- Service worker hanya cache aset statis/app-shell — **data tetap online**; fondasi offline-first disiapkan lewat isolasi repository layer.
- Mobile-first: bottom navigation **Stok · Transaksi · Opname · Laporan · Pengaturan**; tombol besar; input numerik cepat; format Rupiah (`Rp 150.000`).

## 11. Strategi Testing

- **Unit (Vitest)** untuk logika murni: perhitungan selisih opname, snapshot laba penjualan, rata-rata tertimbang modal, invariant saldo ledger (Σ qty_change = stock_qty).
- **Integration ringan**: repository kritis (pembuatan sesi + seed items, apply penyesuaian).
- **E2E (Playwright)** alur kritikal: login → buat produk → stok masuk → penjualan → sesi opname sampai selesai.

## 12. Keputusan Desain & Asumsi

| # | Keputusan | Alasan |
|---|---|---|
| 1 | PWA satu codebase, bukan native terpisah | Cepat dibangun & dirawat; sesuai kebutuhan saat ini |
| 2 | Full online dulu (Neon + Vercel) | Kebutuhan v1; offline disiapkan lewat repository pattern |
| 3 | 1 owner dulu, struktur role sudah ada | Permintaan pengguna; mudah ditambah nanti |
| 4 | Stok per nama, kategori per jenis babaran | Menghindari kerumitan varian per motif |
| 5 | `stock_qty` denormalisasi + ledger | Baca cepat, riwayat tetap lengkap & konsisten |
| 6 | Laba dari `unit_cost_snapshot` | Laporan tetap benar walau modal produk berubah |
| 7 | `system_qty` di-snapshot saat sesi opname dibuat; transaksi tidak dikunci | Sederhana; ada banner peringatan |
| 8 | Produk tidak dihitung saat opname tidak diubah | Menghindari penyesuaian tak disengaja |
| 9 | Hanya satu sesi opname `counting` pada satu waktu | Mencegah konflik snapshot |
| 10 | Uang integer rupiah | Akurasi & kesederhanaan |

## 13. Roadmap Pasca-v1 (tidak dibangun sekarang)

- Aktivasi role admin/kasir + pembatasan fitur per role.
- Offline-first: penyimpanan lokal + sinkronisasi.
- Multi-cabang/multi-gudang.
- Ekspor laporan (PDF/Excel), barcode scanning, cetak label harga.
- Penyesuaian stok manual per item (tanpa sesi opname penuh).
