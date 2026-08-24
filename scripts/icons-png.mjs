// Rasterisasi logo (public/LogoAnindaPayu.png) -> ikon PWA: crop persegi tengah,
// ukuran 192, 512, dan maskable 512. Jalankan: node scripts/icons-png.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const SRC = 'public/LogoAnindaPayu.png';
const DIR = 'public/icons';
const dataUri = `data:image/png;base64,${readFileSync(SRC).toString('base64')}`;

async function shoot(browser, size, out) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(
    `<body style="margin:0"><canvas id="c" width="${size}" height="${size}"></canvas></body>`,
  );
  await page.evaluate(async (uri) => {
    const img = new Image();
    img.src = uri;
    await img.decode();
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - side) / 2;
    const sy = (img.naturalHeight - side) / 2;
    const ctx = document.getElementById('c').getContext('2d');
    ctx.drawImage(img, sx, sy, side, side, 0, 0, ctx.canvas.width, ctx.canvas.height);
  }, dataUri);
  // toDataURL canvas selalu RGBA (color type 6) — wajib agar decoder ICO Next.js menerima.
  const dataUrl = await page.evaluate(() => document.getElementById('c').toDataURL('image/png'));
  writeFileSync(out, Buffer.from(dataUrl.split(',')[1], 'base64'));
  await page.close();
  console.log('OK', out);
}

const browser = await chromium.launch();
await shoot(browser, 192, `${DIR}/icon-192.png`);
await shoot(browser, 512, `${DIR}/icon-512.png`);
await shoot(browser, 512, `${DIR}/icon-maskable-512.png`);
await browser.close();

// Favicon PNG-in-ICO: timpa src/app/favicon.ico (file convention Next) agar
// request default /favicon.ico ikut menyajikan logo baru. Browser modern menerima PNG di dalam .ico.
function pngToIco(png) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // jumlah gambar
  const entry = Buffer.alloc(16);
  entry.writeUInt8(192, 0); // lebar
  entry.writeUInt8(192, 1); // tinggi
  entry.writeUInt16LE(1, 4); // planes
  entry.writeUInt16LE(32, 6); // bpp
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12); // offset data
  return Buffer.concat([header, entry, png]);
}
writeFileSync('src/app/favicon.ico', pngToIco(readFileSync(`${DIR}/icon-192.png`)));
console.log('OK src/app/favicon.ico');
