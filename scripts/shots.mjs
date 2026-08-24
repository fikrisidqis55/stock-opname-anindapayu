// Screenshot batch untuk inspect visual (desktop + mobile).
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const BASE = process.env.SHOT_BASE ?? 'http://localhost:3000';
const OUT = '.impeccable/shots';
mkdirSync(OUT, { recursive: true });

// Cermin dari src/lib/domain.ts#passwordHarian (skrip ini plain ESM).
function passwordHarian() {
  const parts = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: '2-digit',
  }).formatToParts(new Date());
  const dd = parts.find((p) => p.type === 'day').value;
  const mm = parts.find((p) => p.type === 'month').value;
  return `Aninda${dd}${mm}!`;
}

const ROUTES = [
  ['/', 'home'],
  ['/stok', 'stok'],
  ['/transaksi', 'transaksi'],
  ['/transaksi/jual', 'jual'],
  ['/laporan/penjualan', 'laporan-penjualan'],
  ['/laporan/kartu-stok', 'kartu-stok'],
  ['/opname', 'opname'],
  ['/pengaturan', 'pengaturan'],
];

// Buka dialog "Detail" pertama di halaman (kalau ada) lalu screenshot.
async function shotDetail(page, out) {
  const btn = page.getByRole('button', { name: 'Detail' }).first();
  if ((await btn.count()) === 0) return;
  await btn.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: out, fullPage: true });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

let cachedProductId = '';
async function getProductId(page) {
  if (cachedProductId) return cachedProductId;
  await page.goto(`${BASE}/stok`);
  const href = await page
    .locator('a[href*="/stok/"][href$="/edit"]')
    .first()
    .getAttribute('href');
  cachedProductId = href ? href.split('/')[2] : '';
  return cachedProductId;
}

async function login(browser, viewport) {
  // Rotasi hash DB lewat endpoint cron (meniru panggilan Vercel), lalu login.
  await fetch(`${BASE}/api/cron/rotasi-password`, {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET ?? ''}` },
  });
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/login`);
  await page.screenshot({ path: `${OUT}/login.png`, fullPage: true });
  await page.fill('input[name=email]', process.env.OWNER_EMAIL ?? '');
  await page.fill('input[name=password]', passwordHarian());
  await page.click('button[type=submit]');
  await page.waitForURL(`${BASE}/`);
  return { ctx, page };
}

const browser = await chromium.launch();

const mobile = await login(browser, { width: 390, height: 844 });
for (const [path, name] of ROUTES) {
  if (name === 'kartu-stok') {
    const pid = await getProductId(mobile.page);
    if (pid) await mobile.page.goto(`${BASE}${path}?productId=${pid}`);
    else await mobile.page.goto(`${BASE}${path}`);
  } else {
    await mobile.page.goto(`${BASE}${path}`);
  }
  await mobile.page.waitForTimeout(700);
  await mobile.page.screenshot({
    path: `${OUT}/mobile-${name}.png`,
    fullPage: true,
  });
  if (name === 'stok') {
    await shotDetail(mobile.page, `${OUT}/mobile-stok-detail.png`);
  }
  if (name === 'transaksi') {
    await shotDetail(mobile.page, `${OUT}/mobile-transaksi-detail.png`);
  }
  if (name === 'kartu-stok') {
    await shotDetail(mobile.page, `${OUT}/mobile-kartu-stok-detail.png`);
  }
}
await mobile.ctx.close();

const desktop = await login(browser, { width: 1280, height: 900 });
for (const [path, name] of ROUTES.slice(0, 5)) {
  await desktop.page.goto(`${BASE}${path}`);
  await desktop.page.waitForTimeout(700);
  await desktop.page.screenshot({
    path: `${OUT}/desktop-${name}.png`,
    fullPage: true,
  });
  if (name === 'transaksi') {
    await shotDetail(desktop.page, `${OUT}/desktop-transaksi-detail.png`);
  }
}
await desktop.ctx.close();

await browser.close();
console.log('Screenshot selesai di', OUT);
