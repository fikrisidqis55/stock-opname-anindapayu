// Screenshot halaman edit produk untuk cek tampilan value Select kategori.
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const BASE = process.env.SHOT_BASE ?? 'http://localhost:3000';
mkdirSync('.impeccable/shots', { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
await page.goto(`${BASE}/login`);
await page.fill('input[name=email]', process.env.OWNER_EMAIL ?? '');
await page.fill('input[name=password]', process.env.OWNER_PASSWORD ?? '');
await page.click('button[type=submit]');
await page.waitForURL(`${BASE}/`);

await page.goto(`${BASE}/stok`);
const href = await page
  .locator('a[href*="/stok/"][href$="/edit"]')
  .first()
  .getAttribute('href');
if (!href) {
  console.log('Tidak ada produk untuk dibuka di halaman edit.');
} else {
  await page.goto(`${BASE}${href}`);
  await page.waitForTimeout(700);
  await page.screenshot({
    path: '.impeccable/shots/mobile-stok-edit.png',
    fullPage: true,
  });
  console.log('Shot halaman edit:', href);
}
await browser.close();
