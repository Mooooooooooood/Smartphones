/**
 * App-Store / PWA screenshot capture.
 *
 * Captures real in-app screens at iOS device sizes:
 *   - 6.7" (iPhone Pro Max): 1290×2796  (viewport 430×932 @3x)
 *   - 6.1" (iPhone):         1179×2556  (viewport 393×852 @3x)
 *
 * 6.1" shots also land in public/screenshots/ for the web manifest + the
 * in-app About page. 6.7" shots go to marketing/store/ for the App-Store
 * listing. Reuses the safe fresh-port / process-group-kill pattern from
 * screenshotBaseline.mjs so it never orphans a server.
 *
 * Requires a production build first (`npm run build`). Run: `node scripts/storeShots.mjs`.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const PUBLIC_OUT = "public/screenshots";
const STORE_OUT = "marketing/store";
const PORT = 3700 + Math.floor(Math.random() * 600);
const BASE = `http://localhost:${PORT}`;
const CHROME = process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const HARD_TIMEOUT_MS = 120_000;

const SIZES = [
  { id: "6.1", dir: PUBLIC_OUT, w: 393, h: 852, dsf: 3 }, // 1179×2556 → manifest + About
  { id: "6.7", dir: STORE_OUT, w: 430, h: 932, dsf: 3 }, // 1290×2796 → App Store
];

if (!existsSync(".next")) {
  console.error("✗ No .next build found. Run `npm run build` first.");
  process.exit(1);
}
for (const s of SIZES) mkdirSync(s.dir, { recursive: true });

let server;
let browser;
function cleanup() {
  try { browser?.close(); } catch {}
  try { if (server?.pid) process.kill(-server.pid, "SIGKILL"); } catch {}
  try { server?.kill("SIGKILL"); } catch {}
}
const hardTimer = setTimeout(() => {
  console.error("✗ storeShots timed out — killing server and exiting.");
  cleanup();
  process.exit(1);
}, HARD_TIMEOUT_MS);
hardTimer.unref?.();

async function waitReady(tries = 40, gapMs = 500) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(BASE + "/");
      if (r.status === 200) return true;
    } catch { /* not up yet */ }
    await new Promise((res) => setTimeout(res, gapMs));
  }
  return false;
}

/** Capture the named routes at one device size. `play` triggers a live match. */
async function captureSize(size) {
  const ctx = await browser.newContext({
    viewport: { width: size.w, height: size.h },
    deviceScaleFactor: size.dsf,
  });
  // Skip onboarding + seed a little progress so screens look alive.
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("rang-onboarded", "1");
    } catch {}
  });
  const page = await ctx.newPage();

  const routes = [
    ["home", "/"],
    ["academy", "/academy"],
    ["puzzles", "/puzzles"],
    ["profile", "/profile"],
  ];
  for (const [name, path] of routes) {
    await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1400);
    await page.screenshot({ path: `${size.dir}/${name}.png` });
    console.log(`✓ ${size.id}  ${name}`);
  }

  // Live match → saved as "play" (the About page + store use this name).
  try {
    await page.goto(BASE + "/play", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    await page.getByText("Pip the Pawn").first().click();
    await page.waitForTimeout(400);
    await page.getByText("START MATCH").first().click();
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `${size.dir}/play.png` });
    console.log(`✓ ${size.id}  play`);
  } catch (e) {
    // Fall back to the play setup screen so the file always exists.
    await page.goto(BASE + "/play", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${size.dir}/play.png` });
    console.warn(`• ${size.id}  play (setup fallback):`, e.message);
  }

  await ctx.close();
}

async function main() {
  const nextBin = resolve("node_modules/.bin/next");
  const bin = existsSync(nextBin) ? nextBin : "npx";
  const args = bin === "npx" ? ["next", "start", "-p", String(PORT)] : ["start", "-p", String(PORT)];
  server = spawn(bin, args, { stdio: "ignore", detached: true });
  server.on("error", (e) => console.error("✗ Could not start server:", e.message));

  if (!(await waitReady())) {
    console.error(`✗ Server not ready on ${BASE} — aborting.`);
    cleanup();
    process.exit(1);
  }

  browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox"] });
  for (const size of SIZES) await captureSize(size);

  cleanup();
  clearTimeout(hardTimer);
  console.log(`\n✓ Screenshots saved → ${PUBLIC_OUT} (6.1") + ${STORE_OUT} (6.7")`);
  process.exit(0);
}

main().catch((e) => {
  console.error("✗ storeShots failed:", e.message);
  cleanup();
  process.exit(1);
});
