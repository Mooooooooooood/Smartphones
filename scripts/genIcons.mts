/** Rasterize public/icon.svg into the PWA PNG icons using the bundled Chromium. */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const svg = readFileSync("public/icon.svg", "utf8");

const TARGETS = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "apple-touch-icon.png", size: 180 },
  { file: "maskable-icon-512.png", size: 512 },
];

async function main() {
  const browser = await chromium.launch({
    executablePath: process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    args: ["--no-sandbox"],
  });
  for (const { file, size } of TARGETS) {
    const ctx = await browser.newContext({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.setContent(
      `<!doctype html><html><body style="margin:0;width:${size}px;height:${size}px">${svg}</body></html>`,
      { waitUntil: "networkidle" },
    );
    await page.screenshot({ path: `public/${file}`, clip: { x: 0, y: 0, width: size, height: size } });
    await ctx.close();
    console.log("✓", file, `${size}x${size}`);
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
