import { expect, test } from '@playwright/test';
import { eq, inArray } from 'drizzle-orm';
import { db } from '../../src/server/db';
import {
  opnameItems,
  products,
  saleItems,
  sales,
  stockBatches,
  stockMovements,
} from '../../src/server/db/schema';
import { passwordHarian } from '../../src/lib/domain';
import { rotasiPasswordOwner } from '../../src/server/services/rotasiPassword';

const EMAIL = process.env.OWNER_EMAIL!;
const PASSWORD = passwordHarian();

test('alur kritikal: login, produk, stok masuk, penjualan, opname', async ({ page }) => {
  const sku = `E2E ${Date.now()}`;

  // 1. Login (sinkronkan hash DB ke password harian dulu)
  await rotasiPasswordOwner();
  await page.goto('/login');
  await page.fill('input[name=email]', EMAIL);
  await page.fill('input[name=password]', PASSWORD);
  await page.click('button[type=submit]');
  await expect(page).toHaveURL('/');

  // 2. Buat produk
  await page.goto('/stok/baru');
  await page.fill('input[name=name]', sku);
  await page.locator('[data-slot=select-trigger]').click();
  await page.getByRole('option', { name: 'malaman' }).click();
  await page.fill('input[name=priceModal]', '50000');
  await page.fill('input[name=priceEcer]', '90000');
  await page.fill('input[name=priceGrosir]', '85000');
  await page.fill('input[name=priceKulakan]', '80000');
  await page.getByRole('button', { name: 'Simpan Produk' }).click();
  await expect(page).toHaveURL('/stok');
  await expect(page.locator('tr', { hasText: sku })).toBeVisible();

  // 3. Stok masuk produksi 5 pcs
  await page.goto('/transaksi/masuk');
  await page.locator('[data-slot=select-trigger]').click();
  await page.getByRole('option', { name: sku, exact: true }).click();
  await page.fill('input[name=qty]', '5');
  await page.getByRole('button', { name: 'Simpan Stok Masuk' }).click();
  await expect(page.getByText(/tersimpan/i)).toBeVisible();

  // 4. Jual ecer 1 pcs
  await page.goto('/transaksi/jual');
  await page.locator('[data-slot=select-trigger]').first().click();
  await page.getByRole('option', { name: new RegExp(`${sku} \\(stok 5\\)`) }).click();
  await page.getByLabel('Jumlah').fill('1');
  await page.getByRole('button', { name: 'Simpan Penjualan' }).click();
  await expect(page.getByText(/tersimpan/i)).toBeVisible();

  // 5. Opname: hitung fisik 4 (stok sistem 4) lalu terapkan
  await page.goto('/opname');
  await page.getByRole('button', { name: 'Buat Sesi Opname' }).click();
  await page.waitForURL(/\/opname\/.+/);
  await page.locator('tr', { hasText: sku }).locator('input[type=number]').fill('4');
  await page.waitForTimeout(800); // autosave debounce
  await page.getByRole('button', { name: 'Terapkan Penyesuaian' }).click();
  await page.getByRole('button', { name: 'Terapkan', exact: true }).click();
  await expect(page).toHaveURL('/opname');

  // 6. Stok akhir tetap 4 (hitung = sistem)
  await page.goto(`/stok?q=${encodeURIComponent(sku)}`);
  await expect(page.locator('tr', { hasText: sku }).getByText('4', { exact: true })).toBeVisible();

  // 7. Bersihkan data uji
  const [p] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.name, sku));
  if (p) {
    const saleRows = await db
      .select({ saleId: saleItems.saleId })
      .from(saleItems)
      .where(eq(saleItems.productId, p.id));
    const saleIds = saleRows.map((r) => r.saleId);
    await db.delete(saleItems).where(eq(saleItems.productId, p.id));
    if (saleIds.length > 0) await db.delete(sales).where(inArray(sales.id, saleIds));
    await db.delete(stockMovements).where(eq(stockMovements.productId, p.id));
    await db.delete(stockBatches).where(eq(stockBatches.productId, p.id));
    await db.delete(opnameItems).where(eq(opnameItems.productId, p.id));
    await db.delete(products).where(eq(products.id, p.id));
  }
});
