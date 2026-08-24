// Rasterisasi ikon SVG -> PNG (192, 512, maskable 512) untuk manifest/PWA & store.
// Jalankan: node scripts/icons-png.mjs (setelah mengubah icon*.svg)
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const DIR = 'public/icons';

async function shoot(browser, svgPath, size, out) {
  const svg = readFileSync(svgPath, 'utf8')
    .replace(/width="\d+"/, `width="${size}"`)
    .replace(/height="\d+"/, `height="${size}"`);
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<body style="margin:0;overflow:hidden">${svg}</body>`);
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: size, height: size } });
  writeFileSync(out, buf);
  await page.close();
  console.log('OK', out);
}

const browser = await chromium.launch();
await shoot(browser, `${DIR}/icon.svg`, 192, `${DIR}/icon-192.png`);
await shoot(browser, `${DIR}/icon.svg`, 512, `${DIR}/icon-512.png`);
await shoot(browser, `${DIR}/icon-maskable.svg`, 512, `${DIR}/icon-maskable-512.png`);
await browser.close();
