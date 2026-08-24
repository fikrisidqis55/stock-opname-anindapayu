import { expect, test } from '@playwright/test';
import { eq } from 'drizzle-orm';
import { db } from '../../src/server/db';
import { products } from '../../src/server/db/schema';
import { passwordHarian } from '../../src/lib/domain';
import { rotasiPasswordOwner } from '../../src/server/services/rotasiPassword';

const EMAIL = process.env.OWNER_EMAIL!;
const PASSWORD = passwordHarian();

// PNG merah 1x1 yang valid untuk uji kompresi canvas.
const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

test('foto produk dikompres & tersimpan sebagai data-uri', async ({ page }) => {
  const sku = `E2E FOTO ${Date.now()}`;

  // 1. Login (sinkronkan hash DB ke password harian dulu)
  await rotasiPasswordOwner();
  await page.goto('/login');
  await page.fill('input[name=email]', EMAIL);
  await page.fill('input[name=password]', PASSWORD);
  await page.click('button[type=submit]');
  await expect(page).toHaveURL('/');

  // 2. Pilih foto → preview data-URI muncul
  await page.goto('/stok/baru');
  await page.setInputFiles('input[type=file]', {
    name: 'foto.png',
    mimeType: 'image/png',
    buffer: PNG_1X1,
  });
  const img = page.locator('img[alt="Foto produk"]');
  await expect(img).toBeVisible();
  const src = await img.getAttribute('src');
  expect(src ?? '').toMatch(/^data:image\//);

  // 3. Simpan produk dengan foto
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

  // 4. Bersihkan data uji
  await db.delete(products).where(eq(products.name, sku));
});
