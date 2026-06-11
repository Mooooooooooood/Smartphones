/**
 * Visual audit screenshot capture. Usage:
 *   npx tsx scripts/screenshot.mts <outDir> [baseUrl]
 * Captures the main routes at 390px and 430px widths.
 */
import { chromium, type Page } from "playwright";
import { mkdirSync } from "node:fs";

const outDir = process.argv[2] ?? "visual-audit/before";
const base = process.argv[3] ?? "http://localhost:3000";

const ROUTES: { name: string; path: string }[] = [
  { name: "home", path: "/" },
  { name: "academy", path: "/academy" },
  { name: "lesson", path: "/academy/coordinates" },
  { name: "boss", path: "/academy/boss/tier-0" },
  { name: "puzzles", path: "/puzzles" },
  { name: "play-setup", path: "/play" },
  { name: "profile", path: "/profile" },
];

async function settle(page: Page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(1200); // skeletons/hydration/animations
}

async function captureFlow(page: Page, width: number) {
  const tag = (n: string) => `${outDir}/${n}-${width}.png`;

  for (const r of ROUTES) {
    await page.goto(`${base}${r.path}`, { waitUntil: "domcontentloaded" });
    await settle(page);
    await page.screenshot({ path: tag(r.name), fullPage: true });
    console.log("✓", r.name, width);
  }

  // Play: opponent setup → active match → recap (via resign)
  try {
    await page.goto(`${base}/play`, { waitUntil: "domcontentloaded" });
    await settle(page);
    await page.getByText("Pip the Pawn").first().click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: tag("play-intro"), fullPage: true });
    console.log("✓ play-intro", width);

    await page.getByText("Start match").first().click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: tag("play-match"), fullPage: true });
    console.log("✓ play-match", width);

    await page.getByText("Resign").first().click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: tag("play-recap"), fullPage: true });
    console.log("✓ play-recap", width);
  } catch (e) {
    console.error("play flow failed:", (e as Error).message);
  }
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({
    executablePath:
      process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
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
    await captureFlow(page, width);
    await ctx.close();
  }
  await browser.close();
  console.log("done →", outDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
