# Rencana Implementasi: Aninda Payu — Aplikasi Stock Opname Batik

> **Untuk pelaksana:** WAJIB gunakan skill `subagent-driven-development` (disarankan) atau `executing-plans` untuk mengerjakan rencana ini tugas demi tugas. Langkah memakai sintaks checkbox (`- [ ]`) untuk pelacakan.

**Goal:** Membangun PWA stock opname batik "Aninda Payu" — stok masuk (produksi sendiri/kulakan luar), stok keluar (ecer/grosir/kulakan), sesi opname dengan selisih, dan 3 laporan.

**Architecture:** Next.js 16 App Router full-stack. UI (RSC + Server Actions) → services (logika bisnis) → repositories (Drizzle ORM) → PostgreSQL (Neon). Ledger `stock_movements` sebagai sumber kebenaran riwayat; `stock_qty` produk adalah denormalisasi yang diperbarui dalam transaksi DB yang sama.

**Tech Stack:** Next.js 16 · TypeScript · Tailwind CSS v4 · shadcn/ui · Drizzle ORM + drizzle-kit · PostgreSQL (Neon) · next-auth v5 (credentials) · bcryptjs · zod · UploadThing · Vitest · Playwright.

**Spec:** `docs/design/SPEC.md`

## Global Constraints

- Semua uang disimpan sebagai **integer rupiah**; UI menampilkan format `Rp 150.000`.
- **Invariant stok**: `stock_qty` tidak pernah negatif (validasi service + constraint DB `CHECK (stock_qty >= 0)`).
- Setiap mutasi DB yang menyentuh stok **wajib dibungkus `db.transaction`** (ledger + denormalisasi konsisten).
- Semua input server divalidasi **zod**; semua Server Action memverifikasi session sebelum eksekusi.
- Bahasa UI: **Indonesia**. Copy tombol/label mengikuti istilah domain: Stok, Transaksi, Opname, Laporan, Pengaturan, Ecer, Grosir, Kulakan, Produksi Sendiri, Kulakan Luar.
- Satu sesi opname `counting` pada satu waktu; hanya 1 akun aktif (owner) di v1.
- Struktur folder mengikuti SPEC §3; lapisan data terisolasi (repository pattern) untuk rencana offline.
- Commit kecil per tugas dengan pesan konvensional (`feat:`, `test:`, `chore:`).

---

## Struktur File

```
aninda-payu/
├── docs/design/SPEC.md                  # spesifikasi (sudah ada)
├── drizzle.config.ts                    # konfigurasi drizzle-kit
├── vitest.config.ts
├── playwright.config.ts
├── scripts/seed.ts                      # seed kategori babaran + owner
├── public/
│   ├── icons/icon.svg                   # ikon PWA
│   └── sw.js                            # service worker (cache aset statis)
├── src/
│   ├── middleware.ts                    # proteksi rute via auth
│   ├── types/next-auth.d.ts             # augmentasi session (id, role)
│   ├── lib/
│   │   ├── domain.ts                    # weightedAverageCost, opname diff/value (murni)
│   │   ├── format.ts                    # formatRupiah, formatTanggal (murni)
│   │   └── validators.ts                # semua skema zod input
│   ├── server/
│   │   ├── auth.ts                      # NextAuth v5 config (credentials)
│   │   ├── db/
│   │   │   ├── schema.ts                # seluruh tabel + enum
│   │   │   └── index.ts                 # koneksi drizzle
│   │   ├── repositories/
│   │   │   ├── products.ts              # CRUD + list per kategori
│   │   │   ├── categories.ts            # CRUD kategori babaran
│   │   │   ├── reports.ts               # query 3 laporan
│   │   │   └── opname.ts                # query sesi & item
│   │   └── services/
│   │       ├── stockIn.ts               # receiveStock (batch + ledger + stok)
│   │       ├── sales.ts                 # createSale (multi-item + snapshot)
│   │       └── opname.ts                # createSession/saveCount/apply/cancel
│   ├── actions/
│   │   ├── products.ts                  # Server Actions produk (+ kategori)
│   │   ├── transactions.ts              # stok masuk & penjualan
│   │   └── opname.ts                    # aksi sesi opname
│   ├── components/
│   │   ├── ui/                          # hasil shadcn/ui (button, input, dll.)
│   │   ├── layout/app-nav.tsx           # bottom nav mobile + sidebar desktop
│   │   ├── stok/product-form.tsx        # form produk + upload foto
│   │   ├── transaksi/sale-form.tsx      # form penjualan multi-item
│   │   ├── transaksi/stock-in-form.tsx  # form stok masuk
│   │   └── opname/count-sheet.tsx       # lembar hitung opname (autosave)
│   └── app/
│       ├── manifest.ts                  # PWA manifest
│       ├── api/auth/[...nextauth]/route.ts
│       ├── api/uploadthing/route.ts     # UploadThing route handler
│       ├── api/uploadthing/core.ts      # file router
│       ├── (auth)/login/page.tsx
│       └── (dashboard)/
│           ├── layout.tsx               # shell + nav + ServiceWorker registrar
│           ├── page.tsx                 # beranda ringkas (stok menipis, ringkasan)
│           ├── stok/page.tsx            # daftar per kategori babaran
│           ├── stok/baru/page.tsx
│           ├── stok/[id]/edit/page.tsx
│           ├── transaksi/masuk/page.tsx
│           ├── transaksi/jual/page.tsx
│           ├── transaksi/page.tsx       # riwayat transaksi keluar/masuk
│           ├── opname/page.tsx          # daftar sesi
│           ├── opname/[id]/page.tsx     # hitung fisik + preview + apply
│           ├── laporan/page.tsx         # stok per babaran
│           ├── laporan/kartu-stok/page.tsx
│           ├── laporan/penjualan/page.tsx
│           └── pengaturan/page.tsx      # kategori + akun
└── tests/
    ├── unit/                            # Vitest (logika murni)
    └── e2e/                             # Playwright (alur kritikal)
```

---

### Task 1: Scaffolding Proyek & Konfigurasi Dasar

**Files:**
- Create: `package.json` (di-generate), `vitest.config.ts`, `.env.example`, `tsconfig` (modifikasi path scripts)
- Modify: `.gitignore` (tambahan entri Next.js dari create-next-app)

**Interfaces:**
- Consumes: tidak ada
- Produces: proyek Next.js 15 yang bisa `npm run dev` dan `npm test`; alias `@/` → `src/`

- [x] **Step 1: Scaffold Next.js di folder sementara**

Folder `aninda-payu` sudah berisi `.git` dan `docs`. Scaffold di folder terpisah lalu salin:

```powershell
cd d:\Ufeek\work.work.work
npx create-next-app@latest aninda-payu-tmp --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```

Bila ditanya Turbopack/React Compiler, terima default (flag `--yes`).

- [x] **Step 2: Salin hasil scaffold ke `aninda-payu` (kecuali `.git`)**

```powershell
robocopy aninda-payu-tmp aninda-payu /E /XD .git
```

Catatan: exit code robocopy 0–7 berarti sukses. Lalu hapus folder sementara (hanya berisi scaffold + git milik sendiri):

```powershell
Remove-Item -Recurse -Force .\aninda-payu-tmp
```

- [x] **Step 3: Instal dependensi tambahan**

```powershell
cd aninda-payu
npm i drizzle-orm postgres drizzle-kit next-auth@beta @auth/core bcryptjs zod uploadthing @uploadthing/react
npm i -D vitest tsx @types/bcryptjs @playwright/test
```

- [x] **Step 4: Tambah npm scripts**

Tambahkan ke `package.json` bagian `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest",
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:push": "drizzle-kit push",
"db:seed": "tsx --env-file=.env scripts/seed.ts",
"e2e": "playwright test"
```

- [x] **Step 5: Buat `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: { environment: 'node', include: ['tests/unit/**/*.test.ts'] },
});
```

- [x] **Step 6: Buat `.env.example`**

```env
# PostgreSQL (Neon)
DATABASE_URL=postgres://USER:PASSWORD@HOST/dbname?sslmode=require
# Auth.js — generate: npx auth secret
AUTH_SECRET=
# UploadThing — dari dashboard uploadthing.com
UPLOADTHING_TOKEN=
# Untuk seed akun owner (hanya dipakai scripts/seed.ts)
OWNER_EMAIL=owner@anindapayu.example
OWNER_PASSWORD=
```

Salin juga menjadi `.env` lokal (isi kemudian). Pastikan `.gitignore` mengabaikan `.env` (sudah dari scaffold).

- [x] **Step 7: Verifikasi scaffold jalan**

```powershell
npm run build
```

Expected: build sukses (halaman default Next.js).

- [x] **Step 8: Commit**

```powershell
git add .
git commit -m "chore: scaffold Next.js 15 + dependensi dasar"
```

---

### Task 2: Skema Database Drizzle + Koneksi + Seed

**Files:**
- Create: `src/server/db/schema.ts`, `src/server/db/index.ts`, `drizzle.config.ts`, `scripts/seed.ts`
- Modify: `.env` (isi `DATABASE_URL`)

**Interfaces:**
- Consumes: Task 1 (npm scripts, env)
- Produces: `db` (instance drizzle), semua tabel: `users`, `categories`, `products`, `stockBatches`, `sales`, `saleItems`, `stockMovements`, `opnameSessions`, `opnameItems`; seed 5 kategori babaran + owner

- [x] **Step 1: Prasyarat manual — buat database Neon**

Buat project di neon.tech, salin connection string ke `.env` sebagai `DATABASE_URL`.

- [x] **Step 2: Tulis `src/server/db/schema.ts`**

```ts
import { sql } from 'drizzle-orm';
import {
  boolean, check, index, integer, pgEnum, pgTable, text, timestamp,
  uniqueIndex, uuid,
} from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['owner', 'admin', 'cashier']);
export const batchSource = pgEnum('batch_source', ['production', 'purchase']);
export const saleType = pgEnum('sale_type', ['ecer', 'grosir', 'kulakan']);
export const movementType = pgEnum('movement_type', ['in_production', 'in_purchase', 'sale', 'opname_adjust']);
export const movementRefType = pgEnum('movement_ref_type', ['batch', 'sale', 'opname_item']);
export const opnameStatus = pgEnum('opname_status', ['counting', 'completed', 'cancelled']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: userRole('role').notNull().default('owner'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  categoryId: uuid('category_id').notNull().references(() => categories.id),
  photoUrl: text('photo_url'),
  priceModal: integer('price_modal').notNull(),
  priceEcer: integer('price_ecer').notNull(),
  priceGrosir: integer('price_grosir').notNull(),
  priceKulakan: integer('price_kulakan').notNull(),
  stockQty: integer('stock_qty').notNull().default(0),
  minStockQty: integer('min_stock_qty'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  check('products_stock_non_negative', sql`${t.stockQty} >= 0`),
  index('products_category_idx').on(t.categoryId),
  index('products_name_idx').on(t.name),
]);

export const stockBatches = pgTable('stock_batches', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id),
  source: batchSource('source').notNull(),
  qty: integer('qty').notNull(),
  unitCost: integer('unit_cost').notNull(),
  totalCost: integer('total_cost').notNull(),
  supplierName: text('supplier_name'),
  note: text('note'),
  receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('stock_batches_product_idx').on(t.productId)]);

export const sales = pgTable('sales', {
  id: uuid('id').primaryKey().defaultRandom(),
  saleType: saleType('sale_type').notNull(),
  customerName: text('customer_name'),
  totalPrice: integer('total_price').notNull(),
  totalCost: integer('total_cost').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const saleItems = pgTable('sale_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  saleId: uuid('sale_id').notNull().references(() => sales.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  qty: integer('qty').notNull(),
  unitPrice: integer('unit_price').notNull(),
  unitCostSnapshot: integer('unit_cost_snapshot').notNull(),
  subtotal: integer('subtotal').notNull(),
}, (t) => [index('sale_items_sale_idx').on(t.saleId)]);

export const stockMovements = pgTable('stock_movements', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id),
  type: movementType('type').notNull(),
  qtyChange: integer('qty_change').notNull(),
  refType: movementRefType('ref_type').notNull(),
  refId: uuid('ref_id').notNull(),
  note: text('note'),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('stock_movements_product_time_idx').on(t.productId, t.occurredAt)]);

export const opnameSessions = pgTable('opname_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  label: text('label').notNull(),
  status: opnameStatus('status').notNull().default('counting'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  note: text('note'),
  totalDiffQty: integer('total_diff_qty').notNull().default(0),
  totalDiffValue: integer('total_diff_value').notNull().default(0),
}, (t) => [index('opname_sessions_status_idx').on(t.status)]);

export const opnameItems = pgTable('opname_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => opnameSessions.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  systemQty: integer('system_qty').notNull(),
  countedQty: integer('counted_qty'),
}, (t) => [uniqueIndex('opname_items_session_product_uq').on(t.sessionId, t.productId)]);
```

- [x] **Step 3: Tulis `src/server/db/index.ts` dan `drizzle.config.ts`**

```ts
// src/server/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
export const db = drizzle(client, { schema });
```

```ts
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/server/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

- [x] **Step 4: Push skema ke database**

```powershell
npm run db:push
```

Expected: tabel & enum terbuat tanpa error.

- [x] **Step 5: Tulis `scripts/seed.ts`**

```ts
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../src/server/db';
import { categories, users } from '../src/server/db/schema';

const BABARAN = ['malaman', 'colet', 'babar pindo', 'embos', 'babar 1'];

async function main() {
  for (const name of BABARAN) {
    await db.insert(categories).values({ name }).onConflictDoNothing();
  }
  const email = process.env.OWNER_EMAIL;
  const password = process.env.OWNER_PASSWORD;
  if (!email || !password) throw new Error('OWNER_EMAIL dan OWNER_PASSWORD wajib diisi di .env');
  await db
    .insert(users)
    .values({ email, name: 'Owner', passwordHash: await bcrypt.hash(password, 12) })
    .onConflictDoNothing();
  console.log('Seed selesai: kategori babaran + akun owner');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [x] **Step 6: Jalankan seed & verifikasi**

Isi `OWNER_EMAIL`/`OWNER_PASSWORD` di `.env`, lalu:

```powershell
npm run db:seed
```

Expected: "Seed selesai: kategori babaran + akun owner".

- [x] **Step 7: Commit**

```powershell
git add .
git commit -m "feat: skema database Drizzle, koneksi, dan seed kategori + owner"
```

---

### Task 3: Logika Domain Murni (TDD)

**Files:**
- Create: `tests/unit/domain.test.ts`, `tests/unit/format.test.ts`, `src/lib/domain.ts`, `src/lib/format.ts`

**Interfaces:**
- Consumes: tidak ada
- Produces: `weightedAverageCost(oldQty, oldCost, newQty, newCost): number`, `opnameDiffValue(diffQty, priceModal): number`, `formatRupiah(value): string`, `formatTanggal(date): string`

- [x] **Step 1: Tulis tes yang gagal**

```ts
// tests/unit/domain.test.ts
import { describe, expect, it } from 'vitest';
import { opnameDiffValue, weightedAverageCost } from '@/lib/domain';

describe('weightedAverageCost', () => {
  it('menghitung rata-rata tertimbang modal', () => {
    // stok lama 10 @5.000 + masuk 5 @6.000 => (50.000+30.000)/15 = 5.333,33 -> 5333
    expect(weightedAverageCost(10, 5000, 5, 6000)).toBe(5333);
  });
  it('stok lama nol mengembalikan modal baru', () => {
    expect(weightedAverageCost(0, 0, 4, 7500)).toBe(7500);
  });
});

describe('opnameDiffValue', () => {
  it('selisih kurang bernilai negatif', () => {
    expect(opnameDiffValue(-2, 5000)).toBe(-10000);
  });
  it('selisih lebih bernilai positif', () => {
    expect(opnameDiffValue(3, 4000)).toBe(12000);
  });
});
```

```ts
// tests/unit/format.test.ts
import { describe, expect, it } from 'vitest';
import { formatRupiah } from '@/lib/format';

describe('formatRupiah', () => {
  it('format ribuan dengan titik', () => {
    expect(formatRupiah(150000)).toBe('Rp 150.000');
  });
  it('negatif diberi tanda minus', () => {
    expect(formatRupiah(-10000)).toBe('-Rp 10.000');
  });
});
```

- [x] **Step 2: Jalankan tes — pastikan gagal**

```powershell
npm test
```

Expected: FAIL — `@/lib/domain` tidak ditemukan.

- [x] **Step 3: Implementasi minimal**

```ts
// src/lib/domain.ts
export function weightedAverageCost(
  oldQty: number, oldCost: number, newQty: number, newCost: number,
): number {
  const totalQty = oldQty + newQty;
  if (totalQty <= 0) return 0;
  return Math.round((oldQty * oldCost + newQty * newCost) / totalQty);
}

export function opnameDiffValue(diffQty: number, priceModal: number): number {
  return diffQty * priceModal;
}
```

```ts
// src/lib/format.ts
export function formatRupiah(value: number): string {
  const abs = Math.abs(value).toLocaleString('id-ID');
  return value < 0 ? `-Rp ${abs}` : `Rp ${abs}`;
}

export function formatTanggal(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(date));
}
```

- [x] **Step 4: Jalankan tes — pastikan lulus**

```powershell
npm test
```

Expected: semua PASS.

- [x] **Step 5: Commit**

```powershell
git add tests src/lib
git commit -m "test: logika domain murni (modal rata-rata, selisih opname, format rupiah)"
```

---

### Task 4: Autentikasi (Auth.js Credentials)

**Files:**
- Create: `src/server/auth.ts`, `src/types/next-auth.d.ts`, `src/middleware.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/(auth)/login/page.tsx`
- Modify: `.env` (`AUTH_SECRET`)

**Interfaces:**
- Consumes: Task 2 (`db`, `users`)
- Produces: `auth()` helper (session berisi `user.id`, `user.role`), middleware proteksi semua rute kecuali `/login` dan `api/auth`

- [x] **Step 1: Generate AUTH_SECRET**

```powershell
npx auth secret
```

Expected: `AUTH_SECRET` terisi otomatis di `.env`.

- [x] **Step 2: Tulis `src/server/auth.ts`**

```ts
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/server/db';
import { users } from '@/server/db/schema';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email = String(credentials?.email ?? '').toLowerCase().trim();
        const password = String(credentials?.password ?? '');
        if (!email || !password) return null;
        const [user] = await db.select().from(users).where(eq(users.email, email));
        if (!user) return null;
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = user.role; }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as 'owner' | 'admin' | 'cashier';
      return session;
    },
    authorized({ auth: session, request }) {
      if (request.nextUrl.pathname.startsWith('/login')) return true;
      return !!session?.user;
    },
  },
});
```

- [x] **Step 3: Augmentasi tipe `src/types/next-auth.d.ts`**

```ts
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: { id: string; role: 'owner' | 'admin' | 'cashier' } & DefaultSession['user'];
  }
  interface User {
    role: 'owner' | 'admin' | 'cashier';
  }
}

declare module 'next-auth/jwt' {
  interface JWT { id?: string; role?: string; }
}
```

Pastikan `tsconfig.json` `include` mencakup `src/types/**/*.d.ts` (default scaffold sudah mencakup `src`).

- [x] **Step 4: Middleware & route handler**

```ts
// src/middleware.ts
export { auth as middleware } from '@/server/auth';

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|icons|manifest.webmanifest|sw.js).*)'],
};
```

```ts
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/server/auth';

export const { GET, POST } = handlers;
```

- [x] **Step 5: Halaman login `src/app/(auth)/login/page.tsx`**

```tsx
'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await signIn('credentials', {
      email: String(form.get('email')),
      password: String(form.get('password')),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) { setError('Email atau password salah'); return; }
    router.push('/');
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-xl border p-6">
        <div>
          <h1 className="text-xl font-bold">Aninda Payu</h1>
          <p className="text-sm text-muted-foreground">Masuk untuk mengelola stok batik</p>
        </div>
        <input name="email" type="email" required placeholder="Email"
          className="w-full rounded-md border px-3 py-2" />
        <input name="password" type="password" required placeholder="Password"
          className="w-full rounded-md border px-3 py-2" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50">
          {loading ? 'Memproses…' : 'Masuk'}
        </button>
      </form>
    </main>
  );
}
```

- [x] **Step 6: Verifikasi manual**

```powershell
npm run dev
```

- Buka `http://localhost:3000` → harus redirect ke `/login`.
- Login dengan email/password owner dari `.env` → masuk ke `/`.
- Login dengan password salah → muncul "Email atau password salah".

- [x] **Step 7: Commit**

```powershell
git add .
git commit -m "feat: autentikasi Auth.js credentials + middleware proteksi"
```

---

### Task 5: Shell Dashboard — Layout, Navigasi, shadcn/ui

**Files:**
- Create: `src/components/layout/app-nav.tsx`, `src/app/(dashboard)/layout.tsx`, `src/app/(dashboard)/page.tsx`
- Modify: `src/app/layout.tsx` (metadata), `src/app/globals.css` (hasil shadcn)

**Interfaces:**
- Consumes: Task 4 (`auth()` dari `@/server/auth`)
- Produces: shell `(dashboard)` dengan bottom nav mobile & sidebar desktop; komponen shadcn: `button, card, input, label, select, table, badge, dialog, separator, sonner, textarea`

- [x] **Step 1: Inisialisasi shadcn/ui dan tambah komponen**

```powershell
npx shadcn@latest init -y -b neutral
npx shadcn@latest add button card input label select table badge dialog separator sonner textarea
```

- [x] **Step 2: Metadata di `src/app/layout.tsx`**

```tsx
export const metadata: Metadata = {
  title: { default: 'Aninda Payu', template: '%s · Aninda Payu' },
  description: 'Aplikasi stock opname batik Aninda Payu',
};
```

- [x] **Step 3: Navigasi `src/components/layout/app-nav.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const MENU = [
  { href: '/stok', label: 'Stok' },
  { href: '/transaksi', label: 'Transaksi' },
  { href: '/opname', label: 'Opname' },
  { href: '/laporan', label: 'Laporan' },
  { href: '/pengaturan', label: 'Pengaturan' },
] as const;

export function AppNav() {
  const pathname = usePathname();
  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden w-52 shrink-0 border-r p-4 md:block">
        <p className="mb-4 text-lg font-bold">Aninda Payu</p>
        <nav className="space-y-1">
          {MENU.map((m) => (
            <Link key={m.href} href={m.href}
              className={`block rounded-md px-3 py-2 text-sm ${pathname.startsWith(m.href) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
              {m.label}
            </Link>
          ))}
        </nav>
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          className="mt-6 w-full rounded-md border px-3 py-2 text-sm">
          Keluar
        </button>
      </aside>
      {/* Bottom nav mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-background md:hidden">
        {MENU.map((m) => (
          <Link key={m.href} href={m.href}
            className={`flex-1 py-3 text-center text-xs ${pathname.startsWith(m.href) ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
            {m.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
```

- [x] **Step 4: Layout dashboard `src/app/(dashboard)/layout.tsx`**

```tsx
import { redirect } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import { AppNav } from '@/components/layout/app-nav';
import { auth } from '@/server/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  return (
    <div className="flex min-h-dvh">
      <AppNav />
      <main className="w-full flex-1 p-4 pb-20 md:pb-4">{children}</main>
      <Toaster richColors position="top-center" />
    </div>
  );
}
```

- [x] **Step 5: Beranda `src/app/(dashboard)/page.tsx`**

Server component dengan `export const dynamic = 'force-dynamic'`. Query produk aktif dengan `minStockQty` tidak null dan `stockQty <= minStockQty` (import `and, eq, lte, isNotNull` dari drizzle-orm) maksimal 10. Render: judul "Beranda", 4 tombol aksi (Catat Penjualan → `/transaksi/jual`, Stok Masuk → `/transaksi/masuk`, Stock Opname → `/opname`, Laporan → `/laporan`) dalam grid 2 kolom mobile / 4 kolom desktop, lalu seksi "Stok Menipis" berisi daftar nama produk + Badge merah qty, atau teks "Tidak ada produk dengan stok menipis." bila kosong.

- [x] **Step 6: Verifikasi manual**

`npm run dev` → login → beranda tampil dengan 4 tombol aksi; di layar sempit bottom nav terlihat.

- [x] **Step 7: Commit**

```powershell
git add .
git commit -m "feat: shell dashboard, navigasi mobile-first, dan beranda"
```

---

### Task 6: Modul Produk (CRUD + Foto + Kategori Babaran)

**Files:**
- Create: `src/lib/validators.ts`, `src/server/repositories/products.ts`, `src/server/repositories/categories.ts`, `src/actions/products.ts`, `src/app/api/uploadthing/core.ts`, `src/app/api/uploadthing/route.ts`, `src/components/stok/product-form.tsx`, `src/app/(dashboard)/stok/page.tsx`, `src/app/(dashboard)/stok/baru/page.tsx`, `src/app/(dashboard)/stok/[id]/edit/page.tsx`

**Interfaces:**
- Consumes: Task 2 (skema), Task 3 (`formatRupiah`), Task 4 (`auth`)
- Produces: `listProductsGroupedByCategory(search?)`, `getProductById(id)`, `createProduct(input)`, `updateProduct(id, input)`, `listCategories()`; action `createProductAction(raw)`, `updateProductAction(id, raw)`; file router UploadThing `productPhoto`

- [x] **Step 1: Skema zod `src/lib/validators.ts`**

```ts
import { z } from 'zod';

export const productInputSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(120),
  categoryId: z.string().uuid(),
  photoUrl: z.string().nullish().or(z.literal('')),
  priceModal: z.coerce.number().int().min(0),
  priceEcer: z.coerce.number().int().min(0),
  priceGrosir: z.coerce.number().int().min(0),
  priceKulakan: z.coerce.number().int().min(0),
  minStockQty: z.coerce.number().int().min(0).nullish().or(z.literal('')),
});
export type ProductInput = z.infer<typeof productInputSchema>;

export const stockInInputSchema = z.object({
  productId: z.string().uuid(),
  source: z.enum(['production', 'purchase']),
  qty: z.coerce.number().int().min(1),
  unitCost: z.coerce.number().int().min(0),
  supplierName: z.string().max(120).optional().or(z.literal('')),
  note: z.string().max(200).optional().or(z.literal('')),
  updateModal: z.boolean().default(false),
});
export type StockInInput = z.infer<typeof stockInInputSchema>;

export const saleInputSchema = z.object({
  saleType: z.enum(['ecer', 'grosir', 'kulakan']),
  customerName: z.string().max(120).optional().or(z.literal('')),
  note: z.string().max(200).optional().or(z.literal('')),
  items: z.array(z.object({
    productId: z.string().uuid(),
    qty: z.coerce.number().int().min(1),
    unitPrice: z.coerce.number().int().min(0),
  })).min(1, 'Minimal satu produk'),
}).refine(
  (v) => v.saleType !== 'kulakan' || (v.customerName?.trim().length ?? 0) > 0,
  { message: 'Nama bakul wajib diisi untuk kulakan', path: ['customerName'] },
);
export type SaleInput = z.infer<typeof saleInputSchema>;
```

- [x] **Step 2: Repository kategori & produk**

```ts
// src/server/repositories/categories.ts
import { asc } from 'drizzle-orm';
import { db } from '@/server/db';
import { categories } from '@/server/db/schema';

export function listCategories() {
  return db.select().from(categories).orderBy(asc(categories.name));
}
```

```ts
// src/server/repositories/products.ts
import { asc, eq, ilike } from 'drizzle-orm';
import { db } from '@/server/db';
import { categories, products } from '@/server/db/schema';
import type { ProductInput } from '@/lib/validators';

export async function listProductsGroupedByCategory(search?: string) {
  const rows = await db
    .select({ product: products, categoryName: categories.name })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(search ? ilike(products.name, `%${search}%`) : undefined)
    .orderBy(asc(categories.name), asc(products.name));
  const groups = new Map<string, typeof rows>();
  for (const row of rows) {
    const list = groups.get(row.categoryName) ?? [];
    list.push(row);
    groups.set(row.categoryName, list);
  }
  return groups;
}

export async function getProductById(id: string) {
  const [product] = await db.select().from(products).where(eq(products.id, id));
  return product ?? null;
}

export function createProduct(input: ProductInput) {
  return db.insert(products).values({
    name: input.name,
    categoryId: input.categoryId,
    photoUrl: input.photoUrl || null,
    priceModal: input.priceModal,
    priceEcer: input.priceEcer,
    priceGrosir: input.priceGrosir,
    priceKulakan: input.priceKulakan,
    minStockQty: input.minStockQty ?? null,
  });
}

export function updateProduct(id: string, input: ProductInput) {
  return db.update(products).set({
    name: input.name,
    categoryId: input.categoryId,
    photoUrl: input.photoUrl || null,
    priceModal: input.priceModal,
    priceEcer: input.priceEcer,
    priceGrosir: input.priceGrosir,
    priceKulakan: input.priceKulakan,
    minStockQty: input.minStockQty ?? null,
    updatedAt: new Date(),
  }).where(eq(products.id, id));
}
```

- [x] **Step 3: UploadThing — `core.ts` & `route.ts`**

```ts
// src/app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { auth } from '@/server/auth';

const f = createUploadthing();

export const ourFileRouter = {
  productPhoto: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new UploadThingError('Tidak terautentikasi');
      return { userId: session.user.id };
    })
    .onUploadComplete(({ file }) => ({ url: file.ufsUrl })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
```

```ts
// src/app/api/uploadthing/route.ts
import { createRouteHandler } from 'uploadthing/next';
import { ourFileRouter } from './core';

export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
```

Prasyarat manual: buat app di uploadthing.com, isi `UPLOADTHING_TOKEN` di `.env`.

- [x] **Step 4: Server Actions `src/actions/products.ts`**

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { productInputSchema } from '@/lib/validators';
import { auth } from '@/server/auth';
import { createProduct, updateProduct } from '@/server/repositories/products';

export type ActionResult = { ok: boolean; error?: string };

async function requireAuth(): Promise<ActionResult | null> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'Tidak terautentikasi' };
  return null;
}

export async function createProductAction(raw: unknown): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;
  const parsed = productInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  await createProduct(parsed.data);
  revalidatePath('/stok');
  return { ok: true };
}

export async function updateProductAction(id: string, raw: unknown): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;
  const parsed = productInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  await updateProduct(id, parsed.data);
  revalidatePath('/stok');
  return { ok: true };
}
```

- [x] **Step 5: Form produk `src/components/stok/product-form.tsx`**

Client component, props `{ categories: { id: string; name: string }[]; initial?: ProductInput & { id?: string } }`. Field: nama (Input), kategori (Select), foto (`UploadButton` dari `@uploadthing/react` dengan `endpoint="productPhoto"`; `onClientUploadComplete` menyimpan `res[0].ufsUrl` ke state `photoUrl`; tampilkan thumbnail bila ada), harga modal/ecer/grosir/kulakan (Input `type="number"`), stok minimum (Input number, boleh kosong). Submit mengumpulkan objek sesuai `ProductInput` lalu memanggil `createProductAction(values)` atau `updateProductAction(initial.id, values)`; bila `!res.ok` tampilkan `toast.error(res.error)`, bila sukses `toast.success('Produk disimpan')` lalu `router.push('/stok'); router.refresh()`.

- [x] **Step 6: Halaman daftar `src/app/(dashboard)/stok/page.tsx`**

Server component: baca `searchParams.q`, panggil `listProductsGroupedByCategory(q)`; render form pencarian GET + tombol "Tambah Produk" (Link `/stok/baru`); untuk tiap kategori render Card berjudul nama kategori, berisi tabel (Foto thumbnail 40px, Nama, Stok — Badge merah bila ≤ minStockQty, Modal, Ecer, Grosir, Kulakan — semua via `formatRupiah`), dan footer Card dengan total qty + total nilai (qty × priceModal). Nama produk adalah Link ke `/stok/[id]/edit`.

- [x] **Step 7: Halaman baru & edit**

`stok/baru/page.tsx`: ambil `listCategories()`, render `<ProductForm categories={...} />`.
`stok/[id]/edit/page.tsx`: panggil `getProductById(params.id)`; bila null panggil `notFound()`; render `<ProductForm categories={...} initial={product} />`.

- [x] **Step 8: Verifikasi manual**

Buat produk "Kemeja Malaman M01" kategori malaman dengan 4 harga + foto; muncul di `/stok` terkelompok per kategori; edit nama & harga tersimpan.

- [x] **Step 9: Commit**

```powershell
git add .
git commit -m "feat: modul produk — CRUD, foto UploadThing, daftar per kategori babaran"
```

---

### Task 7: Stok Masuk (Produksi Sendiri & Kulakan Luar)

**Files:**
- Create: `src/server/services/stockIn.ts`, `src/actions/transactions.ts`, `src/components/transaksi/stock-in-form.tsx`, `src/app/(dashboard)/transaksi/masuk/page.tsx`

**Interfaces:**
- Consumes: Task 2 (skema), Task 3 (`weightedAverageCost`), Task 6 (validator `stockInInputSchema`, daftar produk)
- Produces: `receiveStock(input: StockInInput)`; action `receiveStockAction(raw): Promise<ActionResult>`

- [x] **Step 1: Service `src/server/services/stockIn.ts`**

```ts
import { eq, sql } from 'drizzle-orm';
import { weightedAverageCost } from '@/lib/domain';
import type { StockInInput } from '@/lib/validators';
import { db } from '@/server/db';
import { products, stockBatches, stockMovements } from '@/server/db/schema';

export async function receiveStock(input: StockInInput) {
  return db.transaction(async (tx) => {
    const [product] = await tx.select().from(products).where(eq(products.id, input.productId));
    if (!product || !product.isActive) throw new Error('Produk tidak ditemukan');

    const totalCost = input.qty * input.unitCost;
    const [batch] = await tx.insert(stockBatches).values({
      productId: input.productId,
      source: input.source,
      qty: input.qty,
      unitCost: input.unitCost,
      totalCost,
      supplierName: input.supplierName?.trim() || null,
      note: input.note?.trim() || null,
    }).returning();

    await tx.insert(stockMovements).values({
      productId: input.productId,
      type: input.source === 'production' ? 'in_production' : 'in_purchase',
      qtyChange: input.qty,
      refType: 'batch',
      refId: batch.id,
    });

    await tx.update(products)
      .set({ stockQty: sql`${products.stockQty} + ${input.qty}`, updatedAt: new Date() })
      .where(eq(products.id, input.productId));

    if (input.updateModal && input.unitCost !== product.priceModal) {
      const newModal = weightedAverageCost(
        product.stockQty, product.priceModal, input.qty, input.unitCost,
      );
      await tx.update(products).set({ priceModal: newModal }).where(eq(products.id, input.productId));
    }
    return batch;
  });
}
```

- [x] **Step 2: Action di `src/actions/transactions.ts`**

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { stockInInputSchema } from '@/lib/validators';
import { auth } from '@/server/auth';
import { receiveStock } from '@/server/services/stockIn';

export type ActionResult = { ok: boolean; error?: string };

export async function receiveStockAction(raw: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'Tidak terautentikasi' };
  const parsed = stockInInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  try {
    await receiveStock(parsed.data);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Gagal menyimpan stok masuk' };
  }
  revalidatePath('/stok');
  revalidatePath('/transaksi');
  return { ok: true };
}
```

- [x] **Step 3: Form & halaman `transaksi/masuk`**

`stock-in-form.tsx` (client): pilih produk (Select dari daftar produk aktif), sumber (radio: Produksi Sendiri / Kulakan Luar), qty, harga modal aktual (default = priceModal produk terpilih — isi otomatis saat produk dipilih, bisa diubah), nama supplier (tampil bila Kulakan Luar), catatan, checkbox "Perbarui harga modal produk ke rata-rata tertimbang" (tampil bila unitCost ≠ modal produk). Submit → `receiveStockAction` → toast sukses & reset form, atau toast error.

`transaksi/masuk/page.tsx`: server component mengambil daftar produk aktif (id, name, priceModal) lalu render `<StockInForm products={...} />`.

- [x] **Step 4: Verifikasi manual**

Tambah stok masuk produksi 10 pcs @modal; cek `/stok` bertambah 10. Kulakan luar dengan modal berbeda + centang rata-rata tertimbang → harga modal produk berubah sesuai rumus Task 3.

- [x] **Step 5: Commit**

```powershell
git add .
git commit -m "feat: stok masuk per batch (produksi sendiri & kulakan luar) + rata-rata tertimbang modal"
```

---

### Task 8: Penjualan — Ecer, Grosir, Kulakan (Multi-item)

**Files:**
- Create: `src/server/services/sales.ts`, `src/components/transaksi/sale-form.tsx`, `src/app/(dashboard)/transaksi/jual/page.tsx`, `src/app/(dashboard)/transaksi/page.tsx`
- Modify: `src/actions/transactions.ts` (tambah `createSaleAction`)

**Interfaces:**
- Consumes: Task 2 (skema), Task 6 (validator `saleInputSchema`, daftar produk)
- Produces: `createSale(input: SaleInput)`, `listRecentSales(limit?)`; action `createSaleAction(raw): Promise<ActionResult>`

- [x] **Step 1: Service `src/server/services/sales.ts`**

```ts
import { desc, eq, inArray, sql } from 'drizzle-orm';
import type { SaleInput } from '@/lib/validators';
import { db } from '@/server/db';
import { products, saleItems, sales, stockMovements } from '@/server/db/schema';

export async function createSale(input: SaleInput) {
  return db.transaction(async (tx) => {
    const prods = await tx.select().from(products)
      .where(inArray(products.id, input.items.map((i) => i.productId)));
    const byId = new Map(prods.map((p) => [p.id, p]));

    // akumulasi qty per produk (satu produk bisa muncul di beberapa baris)
    const totalByProduct = new Map<string, number>();
    for (const item of input.items) {
      const product = byId.get(item.productId);
      if (!product || !product.isActive) throw new Error('Produk tidak ditemukan');
      totalByProduct.set(item.productId, (totalByProduct.get(item.productId) ?? 0) + item.qty);
    }
    for (const [productId, qty] of totalByProduct) {
      const product = byId.get(productId)!;
      if (product.stockQty < qty) {
        throw new Error(`Stok ${product.name} tidak cukup (tersisa ${product.stockQty})`);
      }
    }

    let totalPrice = 0;
    let totalCost = 0;
    const itemValues = input.items.map((item) => {
      const product = byId.get(item.productId)!;
      totalPrice += item.qty * item.unitPrice;
      totalCost += item.qty * product.priceModal;
      return {
        productId: item.productId,
        qty: item.qty,
        unitPrice: item.unitPrice,
        unitCostSnapshot: product.priceModal,
        subtotal: item.qty * item.unitPrice,
      };
    });

    const [sale] = await tx.insert(sales).values({
      saleType: input.saleType,
      customerName: input.customerName?.trim() || null,
      totalPrice,
      totalCost,
      note: input.note?.trim() || null,
    }).returning();

    await tx.insert(saleItems).values(itemValues.map((v) => ({ ...v, saleId: sale.id })));
    await tx.insert(stockMovements).values(input.items.map((item) => ({
      productId: item.productId,
      type: 'sale' as const,
      qtyChange: -item.qty,
      refType: 'sale' as const,
      refId: sale.id,
    })));

    for (const [productId, qty] of totalByProduct) {
      await tx.update(products)
        .set({ stockQty: sql`${products.stockQty} - ${qty}`, updatedAt: new Date() })
        .where(eq(products.id, productId));
    }
    return sale;
  });
}

export function listRecentSales(limit = 50) {
  return db.select().from(sales).orderBy(desc(sales.createdAt)).limit(limit);
}
```

- [x] **Step 2: Action `createSaleAction` di `src/actions/transactions.ts`**

Tambahkan (import `saleInputSchema` dan `createSale`):

```ts
export async function createSaleAction(raw: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'Tidak terautentikasi' };
  const parsed = saleInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  try {
    await createSale(parsed.data);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Gagal menyimpan penjualan' };
  }
  revalidatePath('/stok');
  revalidatePath('/transaksi');
  return { ok: true };
}
```

- [x] **Step 3: Form penjualan `src/components/transaksi/sale-form.tsx`**

Client component, props `{ products }` (produk aktif: id, name, stockQty, priceEcer, priceGrosir, priceKulakan). State: `saleType`, `customerName`, `note`, `items[]` (productId, qty, unitPrice).
- Pilih tipe → harga baris baru otomatis mengikuti tipe; unitPrice per baris tetap bisa diedit (nego).
- Tombol "+ Tambah produk" menambah baris; tiap baris menampilkan stok tersedia.
- Untuk `kulakan`, input nama bakul wajib (label "Nama bakul").
- Total = Σ subtotal, tampil di bawah.
- Submit → `createSaleAction` → toast sukses & reset, atau toast error (termasuk pesan stok tidak cukup).

- [x] **Step 4: Halaman jual & riwayat**

`transaksi/jual/page.tsx`: server component → `<SaleForm products={...} />`.

`transaksi/page.tsx`: riwayat 50 transaksi terakhir (`listRecentSales()`): tanggal, tipe (Badge), nama bakul/pelanggan, total, laba (totalPrice − totalCost) via `formatRupiah`. Link tombol ke `/transaksi/jual` dan `/transaksi/masuk`.

- [x] **Step 5: Verifikasi manual**

Jual ecer 1 pcs → stok berkurang 1. Jual kulakan tanpa nama bakul → error validasi. Jual qty melebihi stok → error "Stok … tidak cukup". Harga nego tersimpan sebagai unitPrice.

- [x] **Step 6: Commit**

```powershell
git add .
git commit -m "feat: penjualan multi-item (ecer/grosir/kulakan) dengan snapshot modal & riwayat"
```

---

### Task 9: Stock Opname — Sesi, Hitung Fisik, Selisih, Penyesuaian

**Files:**
- Create: `src/server/repositories/opname.ts`, `src/server/services/opname.ts`, `src/actions/opname.ts`, `src/components/opname/count-sheet.tsx`, `src/app/(dashboard)/opname/page.tsx`, `src/app/(dashboard)/opname/[id]/page.tsx`

**Interfaces:**
- Consumes: Task 2 (skema), Task 3 (`opnameDiffValue`)
- Produces: `createOpnameSession(label?)`, `saveOpnameCount(sessionId, productId, countedQty)`, `applyOpnameSession(sessionId)`, `cancelOpnameSession(sessionId)`, `listOpnameSessions()`, `getSessionDetail(sessionId)`; actions `createOpnameSessionAction`, `saveOpnameCountAction`, `applyOpnameSessionAction`, `cancelOpnameSessionAction`

- [x] **Step 1: Repository `src/server/repositories/opname.ts`**

```ts
import { asc, desc, eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { categories, opnameItems, opnameSessions, products } from '@/server/db/schema';

export function listOpnameSessions() {
  return db.select().from(opnameSessions).orderBy(desc(opnameSessions.startedAt));
}

export async function getSessionDetail(sessionId: string) {
  const [session] = await db.select().from(opnameSessions).where(eq(opnameSessions.id, sessionId));
  if (!session) return null;
  const items = await db.select({
    item: opnameItems,
    productName: products.name,
    categoryName: categories.name,
    priceModal: products.priceModal,
  }).from(opnameItems)
    .innerJoin(products, eq(opnameItems.productId, products.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(opnameItems.sessionId, sessionId))
    .orderBy(asc(categories.name), asc(products.name));
  return { session, items };
}
```

- [x] **Step 2: Service `src/server/services/opname.ts`**

```ts
import { and, eq, sql } from 'drizzle-orm';
import { opnameDiffValue } from '@/lib/domain';
import { db } from '@/server/db';
import { opnameItems, opnameSessions, products, stockMovements } from '@/server/db/schema';

export async function createOpnameSession(label?: string) {
  return db.transaction(async (tx) => {
    const [active] = await tx.select({ id: opnameSessions.id })
      .from(opnameSessions).where(eq(opnameSessions.status, 'counting')).limit(1);
    if (active) throw new Error('Masih ada sesi opname aktif. Selesaikan atau batalkan dulu.');

    const finalLabel = label?.trim() ||
      `Opname ${new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())}`;
    const [session] = await tx.insert(opnameSessions).values({ label: finalLabel }).returning();

    const prods = await tx.select({ id: products.id, stockQty: products.stockQty })
      .from(products).where(eq(products.isActive, true));
    if (prods.length > 0) {
      await tx.insert(opnameItems).values(prods.map((p) => ({
        sessionId: session.id, productId: p.id, systemQty: p.stockQty,
      })));
    }
    return session;
  });
}

export async function saveOpnameCount(sessionId: string, productId: string, countedQty: number | null) {
  await db.update(opnameItems).set({ countedQty })
    .where(and(eq(opnameItems.sessionId, sessionId), eq(opnameItems.productId, productId)));
}

export async function applyOpnameSession(sessionId: string) {
  return db.transaction(async (tx) => {
    const [session] = await tx.select().from(opnameSessions).where(eq(opnameSessions.id, sessionId));
    if (!session || session.status !== 'counting') throw new Error('Sesi tidak aktif');

    const items = await tx.select({ item: opnameItems, priceModal: products.priceModal })
      .from(opnameItems)
      .innerJoin(products, eq(opnameItems.productId, products.id))
      .where(eq(opnameItems.sessionId, sessionId));

    let totalDiffQty = 0;
    let totalDiffValue = 0;
    for (const { item, priceModal } of items) {
      if (item.countedQty === null) continue; // tidak dihitung = tidak diubah
      const diff = item.countedQty - item.systemQty;
      if (diff === 0) continue;
      totalDiffQty += diff;
      totalDiffValue += opnameDiffValue(diff, priceModal);
      await tx.insert(stockMovements).values({
        productId: item.productId,
        type: 'opname_adjust',
        qtyChange: diff,
        refType: 'opname_item',
        refId: item.id,
        note: `Opname: ${session.label}`,
      });
      await tx.update(products)
        .set({ stockQty: sql`${products.stockQty} + ${diff}`, updatedAt: new Date() })
        .where(eq(products.id, item.productId));
    }

    await tx.update(opnameSessions).set({
      status: 'completed', completedAt: new Date(), totalDiffQty, totalDiffValue,
    }).where(eq(opnameSessions.id, sessionId));
    return { totalDiffQty, totalDiffValue };
  });
}

export async function cancelOpnameSession(sessionId: string) {
  await db.update(opnameSessions).set({ status: 'cancelled', completedAt: new Date() })
    .where(and(eq(opnameSessions.id, sessionId), eq(opnameSessions.status, 'counting')));
}
```

- [x] **Step 3: Actions `src/actions/opname.ts`**

Pola sama dengan Task 7/8 (cek session `auth()`, bungkus error). Empat action:

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/server/auth';
import {
  applyOpnameSession, cancelOpnameSession, createOpnameSession, saveOpnameCount,
} from '@/server/services/opname';

export type ActionResult = { ok: boolean; error?: string };

async function requireAuth(): Promise<ActionResult | null> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'Tidak terautentikasi' };
  return null;
}

export async function createOpnameSessionAction(raw: unknown): Promise<ActionResult & { id?: string }> {
  const denied = await requireAuth();
  if (denied) return denied;
  const parsed = z.object({ label: z.string().max(80).optional().or(z.literal('')) }).safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'Label tidak valid' };
  try {
    const session = await createOpnameSession(parsed.data.label);
    revalidatePath('/opname');
    return { ok: true, id: session.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Gagal membuat sesi' };
  }
}

export async function saveOpnameCountAction(raw: unknown): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;
  const parsed = z.object({
    sessionId: z.string().uuid(),
    productId: z.string().uuid(),
    countedQty: z.coerce.number().int().min(0).nullable(),
  }).safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'Data tidak valid' };
  await saveOpnameCount(parsed.data.sessionId, parsed.data.productId, parsed.data.countedQty);
  return { ok: true };
}

export async function applyOpnameSessionAction(sessionId: string): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;
  try {
    await applyOpnameSession(sessionId);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Gagal menerapkan opname' };
  }
  revalidatePath('/opname');
  revalidatePath('/stok');
  return { ok: true };
}

export async function cancelOpnameSessionAction(sessionId: string): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;
  await cancelOpnameSession(sessionId);
  revalidatePath('/opname');
  return { ok: true };
}
```

- [x] **Step 4: Lembar hitung `src/components/opname/count-sheet.tsx`**

Client component, props `{ sessionId: string; items }` (items dari `getSessionDetail`, status sesi). Perilaku:
- Kelompokkan items per `categoryName`; tiap baris: nama produk, stok sistem (`systemQty`), input jumlah fisik (Input number, kosong = belum dihitung).
- Saat input kehilangan fokus atau berubah (debounce 500ms) → panggil `saveOpnameCountAction({ sessionId, productId, countedQty })` (autosave); nilai kosong kirim `null`.
- Progress bar: `terhitung X dari Y`.
- Banner peringatan kuning: "Stok sistem difoto saat sesi dibuat — jangan catat penjualan / stok masuk selama opname."
- Seksi preview selisih: hanya baris terhitung dengan `countedQty !== systemQty`: produk, sistem, fisik, selisih (warna merah bila negatif, hijau bila positif), nilai selisih via `opnameDiffValue(diff, priceModal)` + `formatRupiah`.
- Tombol "Terapkan Penyesuaian" (Dialog konfirmasi berisi total selisih qty & nilai) → `applyOpnameSessionAction` → toast + `router.push('/opname')`; tombol "Batalkan Sesi" (Dialog konfirmasi) → `cancelOpnameSessionAction`.
- Bila sesi sudah `completed`/`cancelled`: render hanya tabel hasil (tanpa input & tombol).

- [x] **Step 5: Halaman daftar sesi `opname/page.tsx`**

Server component: `listOpnameSessions()`; tombol "Buat Sesi Opname" (form kecil dengan input label opsional → `createOpnameSessionAction`, lalu redirect ke `/opname/[id]`); tabel sesi: label, tanggal mulai, status Badge (`counting` kuning, `completed` hijau, `cancelled` abu), total selisih qty & nilai (untuk completed), Link ke `/opname/[id]`.

- [x] **Step 6: Halaman sesi `opname/[id]/page.tsx`**

Server component: `getSessionDetail(params.id)`; bila null `notFound()`; render judul + status + `<CountSheet ... />`.

- [x] **Step 7: Verifikasi manual**

Buat sesi → semua produk aktif masuk lembar hitung dengan stok sistem; isi sebagian (cicil) → autosave tersimpan (reload tidak hilang); preview selisih benar; terapkan → stok `/stok` berubah sesuai selisih, sesi jadi completed dengan total; produk tidak dihitung tidak berubah; coba buat sesi kedua saat masih aktif → error "Masih ada sesi opname aktif".

- [x] **Step 8: Commit**

```powershell
git add .
git commit -m "feat: stock opname — sesi, hitung fisik autosave, selisih, dan penyesuaian"
```

---

### Task 10: Laporan (Stok per Babaran, Kartu Stok, Penjualan & Laba)

**Files:**
- Create: `src/server/repositories/reports.ts`, `src/app/(dashboard)/laporan/page.tsx`, `src/app/(dashboard)/laporan/kartu-stok/page.tsx`, `src/app/(dashboard)/laporan/penjualan/page.tsx`

**Interfaces:**
- Consumes: Task 2 (skema), Task 3 (`formatRupiah`), Task 6 (`listProductsGroupedByCategory`)
- Produces: `stockCard(productId, from?, to?)`, `salesProfitByType(from?, to?)`

- [x] **Step 1: Query laporan `src/server/repositories/reports.ts`**

```ts
import { and, asc, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '@/server/db';
import { saleItems, sales, stockMovements } from '@/server/db/schema';

export async function stockCard(productId: string, from?: Date, to?: Date) {
  const movements = await db.select().from(stockMovements)
    .where(and(
      eq(stockMovements.productId, productId),
      to ? lte(stockMovements.occurredAt, to) : undefined,
    ))
    .orderBy(asc(stockMovements.occurredAt));

  let balance = 0;
  let totalIn = 0;
  let totalOut = 0;
  const rows: Array<typeof movements[number] & { balance: number }> = [];
  for (const m of movements) {
    balance += m.qtyChange;
    if (from && m.occurredAt < from) continue;
    if (m.qtyChange > 0) totalIn += m.qtyChange;
    else totalOut += -m.qtyChange;
    rows.push({ ...m, balance });
  }
  return { rows, totalIn, totalOut };
}

export async function salesProfitByType(from?: Date, to?: Date) {
  return db
    .select({
      saleType: sales.saleType,
      transactions: sql<number>`count(distinct ${sales.id})`,
      totalQty: sql<number>`coalesce(sum(${saleItems.qty}), 0)::int`,
      revenue: sql<number>`coalesce(sum(${saleItems.subtotal}), 0)::int`,
      cost: sql<number>`coalesce(sum(${saleItems.qty} * ${saleItems.unitCostSnapshot}), 0)::int`,
    })
    .from(saleItems)
    .innerJoin(sales, eq(saleItems.saleId, sales.id))
    .where(and(
      from ? gte(sales.createdAt, from) : undefined,
      to ? lte(sales.createdAt, to) : undefined,
    ))
    .groupBy(sales.saleType);
}
```

Catatan: saldo berjalan benar karena setiap perubahan stok selalu menulis ledger, sehingga saldo dapat dihitung dari nol. Label tipe movement di UI: `in_production` = "Produksi sendiri", `in_purchase` = "Kulakan luar", `sale` = "Penjualan", `opname_adjust` = "Penyesuaian opname".

- [x] **Step 2: Laporan stok per babaran `laporan/page.tsx`**

Server component: gunakan `listProductsGroupedByCategory()` (Task 6). Render Card per kategori: tabel produk (nama, qty, nilai = qty × priceModal), subtotal qty & nilai per kategori, grand total. Link ke `/laporan/kartu-stok` dan `/laporan/penjualan` di atas halaman.

- [x] **Step 3: Kartu stok `laporan/kartu-stok/page.tsx`**

Server component membaca `searchParams`: `productId`, `from`, `to` (yyyy-mm-dd). Render form GET: Select produk + dua input `type="date"`. Bila `productId` ada: panggil `stockCard(productId, parse(from), parse(to))` (konversi `to` menjadi akhir hari: `new Date(to + 'T23:59:59')`), render tabel kronologis: tanggal (`formatTanggal`), tipe kejadian (label di atas), masuk (+), keluar (−), saldo berjalan; kartu ringkasan: total masuk, total keluar, selisih.

- [x] **Step 4: Penjualan & laba `laporan/penjualan/page.tsx`**

Server component membaca `searchParams.from`/`to` (default: awal bulan berjalan s.d. hari ini). Render form GET rentang tanggal + hasil `salesProfitByType(from, to)`: tabel baris per tipe (Ecer/Grosir/Kulakan): jumlah transaksi, qty, omzet, HPP, laba (revenue − cost); baris total. Di bawahnya grafik batang harian sederhana: query tambahan `dailySales(from, to)` di `reports.ts` — `select date_trunc('day', sales.createdAt) as day, sum(totalPrice) group by 1 order by 1` — lalu render batang dengan `<div style={{ height: pct }}>` relatif terhadap nilai maksimum (tanpa library chart).

- [x] **Step 5: Verifikasi manual**

Dengan data hasil Task 7–9: laporan stok per babaran menampilkan total qty & nilai; kartu stok menampilkan mutasi + saldo berjalan yang ujungnya sama dengan stok di `/stok`; laporan penjualan menampilkan omzet/HPP/laba per tipe yang sesuai dengan transaksi yang dibuat.

- [x] **Step 6: Commit**

```powershell
git add .
git commit -m "feat: laporan stok per babaran, kartu stok, dan penjualan & laba per tipe"
```

---

### Task 11: Pengaturan (Kategori Babaran & Akun) + PWA

**Files:**
- Create: `src/actions/settings.ts`, `src/app/(dashboard)/pengaturan/page.tsx`, `src/app/manifest.ts`, `public/icons/icon.svg`, `public/sw.js`, `src/components/layout/sw-register.tsx`
- Modify: `src/app/(dashboard)/layout.tsx` (tambah `<SwRegister />`)

**Interfaces:**
- Consumes: Task 4 (`auth`), Task 6 (`listCategories`)
- Produces: `addCategoryAction(raw)`, `renameCategoryAction(id, raw)`; PWA manifest + service worker

- [x] **Step 1: Actions kategori `src/actions/settings.ts`**

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { categories } from '@/server/db/schema';

export type ActionResult = { ok: boolean; error?: string };

const nameSchema = z.object({ name: z.string().min(1, 'Nama wajib diisi').max(60) });

async function requireAuth(): Promise<ActionResult | null> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'Tidak terautentikasi' };
  return null;
}

export async function addCategoryAction(raw: unknown): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;
  const parsed = nameSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Tidak valid' };
  try {
    await db.insert(categories).values({ name: parsed.data.name.trim() });
  } catch {
    return { ok: false, error: 'Nama kategori sudah ada' };
  }
  revalidatePath('/pengaturan');
  revalidatePath('/stok');
  return { ok: true };
}

export async function renameCategoryAction(id: string, raw: unknown): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;
  const parsed = nameSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Tidak valid' };
  await db.update(categories).set({ name: parsed.data.name.trim(), updatedAt: new Date() })
    .where(eq(categories.id, id));
  revalidatePath('/pengaturan');
  revalidatePath('/stok');
  return { ok: true };
}
```

- [x] **Step 2: Halaman `pengaturan/page.tsx`**

Server component: daftar kategori (`listCategories()`) dengan tombol ubah nama (Dialog berisi input → `renameCategoryAction`), form tambah kategori (`addCategoryAction`), dan kartu Akun berisi email + role dari session (baca via `auth()`).

- [x] **Step 3: PWA — `src/app/manifest.ts`**

```ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aninda Payu',
    short_name: 'Aninda Payu',
    description: 'Aplikasi stock opname batik Aninda Payu',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#7c2d12',
    icons: [{ src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  };
}
```

- [x] **Step 4: Ikon `public/icons/icon.svg`**

SVG 512×512 bertema batik: latar cokelat soga (`#7c2d12`), motif parang sederhana (garis diagonal berulang) warna krem, inisial "AP" putih di tengah. Buat dengan editor/ generator apa pun; yang penting valid SVG 512×512.

- [x] **Step 5: Service worker `public/sw.js` + registrasi**

```js
const CACHE = 'aninda-payu-static-v1';
const STATIC = ['/icons/icon.svg', '/manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
    )).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  const cacheable = url.pathname.startsWith('/_next/static/') || STATIC.includes(url.pathname);
  if (!cacheable) return; // data & server actions selalu network
  e.respondWith(
    caches.match(e.request).then((cached) => cached ?? fetch(e.request).then((res) => {
      const clone = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, clone));
      return res;
    })),
  );
});
```

```tsx
// src/components/layout/sw-register.tsx
'use client';

import { useEffect } from 'react';

export function SwRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);
  return null;
}
```

Tambahkan `<SwRegister />` di dalam `(dashboard)/layout.tsx`.

- [x] **Step 6: Verifikasi manual**

Tambah & ubah nama kategori berfungsi. Buka Chrome DevTools → Application: manifest terdeteksi, tombol install muncul; service worker registered; aset `/_next/static` ter-cache; saat offline app shell tetap terbuka (data tetap butuh online — sesuai desain).

- [x] **Step 7: Commit**

```powershell
git add .
git commit -m "feat: pengaturan kategori & akun, PWA manifest + service worker"
```

---

### Task 12: E2E Test, README, dan Catatan Deploy

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/critical-flow.spec.ts`, `README.md`

**Interfaces:**
- Consumes: seluruh task sebelumnya
- Produces: `npm run e2e` menjalankan alur kritikal; README berisi setup lokal & deploy

- [x] **Step 1: Instal browser Playwright & konfigurasi**

```powershell
npx playwright install chromium
```

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/login',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
```

- [x] **Step 2: Tes alur kritikal `tests/e2e/critical-flow.spec.ts`**

Prasyarat: `.env` terisi (DB, AUTH_SECRET) dan `npm run db:seed` sudah dijalankan. Kredensial dibaca dari env. Bila selector tidak cocok karena perbedaan implementasi form, sesuaikan dengan atribut `name` field yang didefinisikan di Task 5–9.

```ts
import { expect, test } from '@playwright/test';

const EMAIL = process.env.OWNER_EMAIL!;
const PASSWORD = process.env.OWNER_PASSWORD!;

test('alur kritikal: login, produk, stok masuk, penjualan, opname', async ({ page }) => {
  const sku = `E2E ${Date.now()}`;

  // 1. Login
  await page.goto('/login');
  await page.fill('input[name=email]', EMAIL);
  await page.fill('input[name=password]', PASSWORD);
  await page.click('button[type=submit]');
  await expect(page).toHaveURL('/');

  // 2. Buat produk
  await page.goto('/stok/baru');
  await page.fill('input[name=name]', sku);
  await page.getByRole('combobox').first().click();
  await page.getByRole('option', { name: 'malaman' }).click();
  await page.fill('input[name=priceModal]', '50000');
  await page.fill('input[name=priceEcer]', '90000');
  await page.fill('input[name=priceGrosir]', '85000');
  await page.fill('input[name=priceKulakan]', '80000');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL('/stok');
  await expect(page.getByText(sku)).toBeVisible();

  // 3. Stok masuk produksi 5 pcs
  await page.goto('/transaksi/masuk');
  await page.getByRole('combobox').first().click();
  await page.getByRole('option', { name: sku }).click();
  await page.fill('input[name=qty]', '5');
  await page.click('button[type=submit]');
  await expect(page.getByText(/tersimpan/i)).toBeVisible();

  // 4. Jual ecer 1 pcs
  await page.goto('/transaksi/jual');
  await page.getByRole('combobox').first().click(); // pilih produk di baris item
  await page.getByRole('option', { name: sku }).click();
  await page.fill('input[name*=qty]', '1');
  await page.click('button[type=submit]');
  await expect(page.getByText(/tersimpan/i)).toBeVisible();

  // 5. Opname: hitung fisik 4 (stok sistem 4) lalu terapkan
  await page.goto('/opname');
  await page.click('button:has-text("Buat Sesi Opname")');
  await page.waitForURL(/\/opname\/.+/);
  const row = page.locator('tr', { hasText: sku });
  await row.locator('input[type=number]').fill('4');
  await page.waitForTimeout(800); // autosave debounce
  await page.click('button:has-text("Terapkan Penyesuaian")');
  await page.getByRole('button', { name: /konfirmasi|ya/i }).click();
  await expect(page).toHaveURL('/opname');

  // 6. Stok akhir tetap 4 (hitung = sistem)
  await page.goto('/stok');
  await page.fill('input[name=q]', sku);
  await page.getByText(sku).click(); // masuk ke edit; alternatif cek badge qty langsung
});
```

- [x] **Step 3: Jalankan E2E**

```powershell
npm run e2e
```

Expected: 1 test lulus. Bila gagal karena selector, perbaiki selector sesuai markup aktual (field form memakai atribut `name`).

- [x] **Step 4: Tulis `README.md`**

Isi: deskripsi aplikasi; prasyarat (Node 20+, akun Neon, akun UploadThing); setup lokal (`npm i`, salin `.env.example` → `.env`, `npm run db:push`, `npm run db:seed`, `npm run dev`); script penting (`npm test`, `npm run e2e`, `npm run db:generate/migrate`); tautan ke `docs/design/SPEC.md` dan `docs/design/PLAN.md`.

- [x] **Step 5: Verifikasi akhir menyeluruh**

```powershell
npm test
npm run build
npm run e2e
```

Expected: semua lulus.

- [x] **Step 6: Commit**

```powershell
git add .
git commit -m "test: e2e alur kritikal + README setup & deploy"
```

**Catatan deploy (Vercel):** import repo ke Vercel → set env `DATABASE_URL` (Neon), `AUTH_SECRET`, `UPLOADTHING_TOKEN` → jalankan `npm run db:migrate` dan `npm run db:seed` sekali (Vercel: menu project → Settings → atau jalankan lokal menunjuk DB produksi). Setelah deploy, tambahkan aplikasi ke home screen HP untuk pengalaman mobile.
