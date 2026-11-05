// Renders the icon SVGs to every PNG/ICO the project uses.
// Usage (from the repo root): node design/icon/render.mjs
// Needs Playwright with Chromium available (npx playwright install chromium).
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const svg = (name) => readFileSync(join(here, name), 'utf8');

const targets = [
  // [svg, size, output]
  ['arraythis-icon.svg', 1024, 'desktop/build/appicon.png'],
  ...[72, 96, 128, 144, 152, 192, 384, 512].map(s => ['arraythis-icon.svg', s, `src/assets/icons/icon-${s}x${s}.png`]),
  ['arraythis-icon-maskable.svg', 192, 'src/assets/icons/maskable-192x192.png'],
  ['arraythis-icon-maskable.svg', 512, 'src/assets/icons/maskable-512x512.png'],
  ['arraythis-icon-maskable.svg', 180, 'src/assets/icons/apple-touch-icon.png'],
];
const faviconSizes = [16, 32, 48];

const browser = await chromium.launch(process.env.CH ? { executablePath: process.env.CH } : {});
const page = await browser.newPage();

async function render(name, size) {
  await page.setViewportSize({ width: size, height: size });
  const markup = svg(name).replace(/width="1024" height="1024"/, `width="${size}" height="${size}"`);
  await page.setContent(`<html><body style="margin:0;background:transparent">${markup}</body></html>`);
  return page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
}

for (const [name, size, out] of targets) {
  writeFileSync(join(root, out), await render(name, size));
  console.log('wrote', out);
}

// favicon.ico with embedded PNG entries (supported by all current browsers)
const pngs = [];
for (const s of faviconSizes) pngs.push([s, await render('arraythis-icon-favicon.svg', s)]);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(pngs.length, 4);
let offset = 6 + 16 * pngs.length;
const entries = pngs.map(([s, buf]) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0); e.writeUInt8(s, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(buf.length, 8); e.writeUInt32LE(offset, 12);
  offset += buf.length;
  return e;
});
writeFileSync(join(root, 'src/favicon.ico'), Buffer.concat([header, ...entries, ...pngs.map(p => p[1])]));
console.log('wrote src/favicon.ico', faviconSizes.join('/'));

await browser.close();
