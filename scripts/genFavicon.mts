/**
 * Rasterizes public/icon.svg into a multi-size src/app/favicon.ico so the
 * legacy browser-tab favicon matches the new crowned-pawn brand icon.
 * ICO entries embed PNGs directly (supported by all modern browsers).
 * Run after `npm run genicon`.
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const svg = readFileSync("public/icon.svg", "utf8");
const SIZES = [16, 32, 48, 64];

async function main() {
  const browser = await chromium.launch({
    executablePath: process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    args: ["--no-sandbox"],
  });
  const pngs: { size: number; data: Buffer }[] = [];
  for (const size of SIZES) {
    const ctx = await browser.newContext({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.setContent(
      `<!doctype html><html><body style="margin:0;width:${size}px;height:${size}px">${svg}</body></html>`,
      { waitUntil: "networkidle" },
    );
    const buf = await page.screenshot({ clip: { x: 0, y: 0, width: size, height: size } });
    pngs.push({ size, data: Buffer.from(buf) });
    await ctx.close();
  }
  await browser.close();

  // ICO container: 6-byte header + 16-byte dir entry per image + PNG payloads.
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4);

  const entries: Buffer[] = [];
  let offset = 6 + pngs.length * 16;
  for (const { size, data } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // width
    e.writeUInt8(size >= 256 ? 0 : size, 1); // height
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += data.length;
  }

  const ico = Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
  writeFileSync("src/app/favicon.ico", ico);
  console.log(`✓ src/app/favicon.ico written (${SIZES.join(", ")} px, ${ico.length} bytes)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
