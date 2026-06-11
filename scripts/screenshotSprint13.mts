/**
 * Sprint 13 visual audit — captures core routes in BOTH light and dark themes
 * at 390px and 430px. Usage:
 *   npx tsx scripts/screenshotSprint13.mts <outDir> [baseUrl]
 */
import { chromium, type Browser, type Page } from "playwright";
import { mkdirSync } from "node:fs";

const outDir = process.argv[2] ?? "visual-audit/sprint13/before";
const base = process.argv[3] ?? "http://localhost:3000";

const ROUTES: { name: string; path: string }[] = [
  { name: "home", path: "/" },
  { name: "academy", path: "/academy" },
  { name: "lesson", path: "/academy/coordinates" },
  { name: "puzzles", path: "/puzzles" },
  { name: "play-setup", path: "/play" },
  { name: "profile", path: "/profile" },
  { name: "offline", path: "/offline" },
];

async function settle(page: Page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(1100);
}

async function captureTheme(
  browser: Browser,
  width: number,
  theme: "light" | "dark",
) {
  const ctx = await browser.newContext({
    viewport: { width, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: theme,
  });
  await ctx.addInitScript((t) => {
    try {
      localStorage.setItem("tabiya-theme", t as string);
    } catch {}
  }, theme);
  const page = await ctx.newPage();
  const tag = (n: string) => `${outDir}/${n}-${theme}-${width}.png`;

  for (const r of ROUTES) {
    await page.goto(`${base}${r.path}`, { waitUntil: "domcontentloaded" });
    await settle(page);
    await page.screenshot({ path: tag(r.name), fullPage: true });
    console.log("✓", r.name, theme, width);
  }

  // Play flow → recap
  try {
    await page.goto(`${base}/play`, { waitUntil: "domcontentloaded" });
    await settle(page);
    await page.getByText("Pip the Pawn").first().click();
    await page.waitForTimeout(500);
    await page.getByText("Start match").first().click();
    await page.waitForTimeout(1400);
    await page.screenshot({ path: tag("play-match"), fullPage: true });
    await page.getByText("Resign").first().click();
    await page.waitForTimeout(1400);
    await page.screenshot({ path: tag("play-recap"), fullPage: true });
    console.log("✓ play-recap", theme, width);
  } catch (e) {
    console.error("play flow failed:", (e as Error).message);
  }

  // Interactive lesson flow (intro → try → reward) at 390 only
  if (width === 390) {
    try {
      await page.goto(`${base}/academy/coordinates`, { waitUntil: "domcontentloaded" });
      await settle(page);
      await page.screenshot({ path: tag("lesson-intro"), fullPage: true });
      const cont = () => page.getByRole("button", { name: /Continue/ }).first();
      await cont().click(); // intro → board-demo
      await page.waitForTimeout(400);
      await cont().click(); // board-demo → tap e4
      await page.waitForTimeout(500);
      await page.screenshot({ path: tag("lesson-try"), fullPage: true });
      // solve the stages
      await page.locator('[data-square="e4"]').click({ timeout: 2500 });
      await page.waitForTimeout(400);
      await cont().click(); // → tap a1
      await page.waitForTimeout(400);
      await page.locator('[data-square="a1"]').click({ timeout: 2500 });
      await page.waitForTimeout(400);
      await cont().click(); // → checkpoint
      await page.waitForTimeout(400);
      await page.getByText("h1, a light square").click();
      await page.waitForTimeout(400);
      await page.getByRole("button", { name: /Finish/ }).first().click();
      await page.waitForTimeout(900);
      await page.screenshot({ path: tag("lesson-reward"), fullPage: true });
      console.log("✓ lesson flow", theme, width);
    } catch (e) {
      console.error("lesson flow failed:", (e as Error).message);
    }
  }
  await ctx.close();
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({
    executablePath:
      process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    args: ["--no-sandbox"],
  });
  for (const width of [390, 430]) {
    for (const theme of ["light", "dark"] as const) {
      await captureTheme(browser, width, theme);
    }
  }
  await browser.close();
  console.log("done →", outDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
