/**
 * Rasterizes public/icon.svg into a multi-size src/app/favicon.ico so the
 * legacy browser-tab favicon matches the new crowned-pawn brand icon.
 *
 * Entries are classic 32-bpp BMP/DIB images (BGRA, bottom-up) built from raw
 * canvas pixels — not embedded PNGs — so the icon is unambiguously RGBA, which
 * the .ico decoder and Next/Turbopack image processing both require.
 * Run after `npm run genicon`.
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const svg = readFileSync("public/icon.svg", "utf8");
const SIZES = [16, 32, 48, 64];

/** Build one 32-bpp BMP ICO image block (BITMAPINFOHEADER + XOR + AND mask). */
function bmpEntry(size: number, rgba: Buffer): Buffer {
  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0); // biSize
  header.writeInt32LE(size, 4); // biWidth
  header.writeInt32LE(size * 2, 8); // biHeight (XOR + AND)
  header.writeUInt16LE(1, 12); // biPlanes
  header.writeUInt16LE(32, 14); // biBitCount
  header.writeUInt32LE(0, 16); // biCompression = BI_RGB

  // XOR bitmap: bottom-up rows, BGRA.
  const xor = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    const src = (size - 1 - y) * size * 4;
    const dst = y * size * 4;
    for (let x = 0; x < size * 4; x += 4) {
      xor[dst + x] = rgba[src + x + 2]; // B
      xor[dst + x + 1] = rgba[src + x + 1]; // G
      xor[dst + x + 2] = rgba[src + x]; // R
      xor[dst + x + 3] = rgba[src + x + 3]; // A
    }
  }
  // AND mask: 1bpp, rows padded to 32 bits, all opaque (zero).
  const maskRow = (((size + 31) >> 5) << 2);
  const and = Buffer.alloc(maskRow * size, 0);
  header.writeUInt32LE(xor.length, 20); // biSizeImage
  return Buffer.concat([header, xor, and]);
}

async function main() {
  const browser = await chromium.launch({
    executablePath: process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();

  const images: { size: number; block: Buffer }[] = [];
  for (const size of SIZES) {
    const arr: number[] = await page.evaluate(async ({ svg, size }) => {
      const img = new Image();
      img.src = "data:image/svg+xml;base64," + btoa(svg);
      await img.decode();
      const c = document.createElement("canvas");
      c.width = size; c.height = size;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0, size, size);
      return Array.from(ctx.getImageData(0, 0, size, size).data);
    }, { svg, size });
    images.push({ size, block: bmpEntry(size, Buffer.from(arr)) });
  }
  await browser.close();

  // ICONDIR header (6) + ICONDIRENTRY (16 each) + image blocks.
  const head = Buffer.alloc(6);
  head.writeUInt16LE(0, 0); // reserved
  head.writeUInt16LE(1, 2); // type: icon
  head.writeUInt16LE(images.length, 4);

  const entries: Buffer[] = [];
  let offset = 6 + images.length * 16;
  for (const { size, block } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // planes
    e.writeUInt16LE(32, 6); // bpp
    e.writeUInt32LE(block.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += block.length;
  }

  const ico = Buffer.concat([head, ...entries, ...images.map((i) => i.block)]);
  writeFileSync("src/app/favicon.ico", ico);
  console.log(`✓ src/app/favicon.ico written (${SIZES.join(", ")} px, 32-bpp BMP, ${ico.length} bytes)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
