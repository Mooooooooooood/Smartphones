/** Final-pass screenshots for Profile, Lesson, Play recap → visual-audit/final */
import { chromium, type Page } from "playwright";
import { mkdirSync } from "node:fs";

const outDir = "visual-audit/final";
const base = "http://localhost:3000";

async function settle(page: Page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(1300);
}

async function flow(page: Page, width: number) {
  const tag = (n: string) => `${outDir}/${n}-${width}.png`;

  await page.goto(`${base}/profile`, { waitUntil: "domcontentloaded" });
  await settle(page);
  await page.screenshot({ path: tag("profile"), fullPage: true });

  await page.goto(`${base}/academy/coordinates`, { waitUntil: "domcontentloaded" });
  await settle(page);
  await page.screenshot({ path: tag("lesson"), fullPage: true });

  // recap via Pip resign
  await page.goto(`${base}/play`, { waitUntil: "domcontentloaded" });
  await settle(page);
  await page.getByText("Pip the Pawn").first().click();
  await page.waitForTimeout(500);
  await page.getByText("Start match").first().click();
  await page.waitForTimeout(1400);
  await page.getByText("Resign").first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: tag("play-recap"), fullPage: true });
  console.log("✓", width);
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    args: ["--no-sandbox"],
  });
  for (const width of [390, 430]) {
    const ctx = await browser.newContext({
      viewport: { width, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const page = await ctx.newPage();
    await flow(page, width);
    await ctx.close();
  }
  await browser.close();
  console.log("done →", outDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
