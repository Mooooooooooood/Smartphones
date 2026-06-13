/**
 * Safe visual-regression baseline capture.
 *
 * - starts `next start` on a fresh, randomised port (it manages its own server)
 * - waits for readiness with a BOUNDED poll (no endless CSS/chunk retry loop)
 * - captures 390px screenshots of the core screens into visual-audit/baseline/
 * - always kills its own server and force-exits within a hard timeout
 *
 * Requires a production build first (`npm run build`). Run via `npm run baseline`.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const OUT = "visual-audit/baseline";
const PORT = 3100 + Math.floor(Math.random() * 600);
const BASE = `http://localhost:${PORT}`;
const CHROME = process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const HARD_TIMEOUT_MS = 90_000;

if (!existsSync(".next")) {
  console.error("✗ No .next build found. Run `npm run build` first.");
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

let server;
let browser;
function cleanup() {
  try { browser?.close(); } catch {}
  // Kill the whole process group (detached) so no `next start` child is orphaned.
  try { if (server?.pid) process.kill(-server.pid, "SIGKILL"); } catch {}
  try { server?.kill("SIGKILL"); } catch {}
}
const hardTimer = setTimeout(() => {
  console.error("✗ Baseline timed out — killing server and exiting.");
  cleanup();
  process.exit(1);
}, HARD_TIMEOUT_MS);
hardTimer.unref?.();

async function waitReady(tries = 30, gapMs = 500) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(BASE + "/");
      if (r.status === 200) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((res) => setTimeout(res, gapMs));
  }
  return false;
}

async function main() {
  // Spawn the local `next` binary directly (no npx wrapper) in its own process
  // group so cleanup can reap the whole tree — never leaves an orphan server.
  const nextBin = resolve("node_modules/.bin/next");
  const bin = existsSync(nextBin) ? nextBin : "npx";
  const args = bin === "npx" ? ["next", "start", "-p", String(PORT)] : ["start", "-p", String(PORT)];
  server = spawn(bin, args, { stdio: "ignore", detached: true });
  server.on("error", (e) => { console.error("✗ Could not start server:", e.message); });

  const ready = await waitReady();
  if (!ready) {
    console.error(`✗ Server not ready on ${BASE} after bounded wait — aborting (no retry loop).`);
    cleanup();
    process.exit(1);
  }

  browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  // Skip onboarding so screens are clean.
  await ctx.addInitScript(() => { try { localStorage.setItem("rang-onboarded", "1"); } catch {} });

  const routes = [
    ["home", "/"],
    ["academy", "/academy"],
    ["puzzles", "/puzzles"],
    ["play-setup", "/play"],
    ["profile", "/profile"],
  ];
  for (const [name, path] of routes) {
    await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1400);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    console.log("✓", name);
  }

  // Live match (best-effort — don't fail the run if the flow changes).
  try {
    await page.goto(BASE + "/play", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    await page.getByText("Pip the Pawn").first().click();
    await page.waitForTimeout(500);
    await page.getByText("START MATCH").first().click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/live-match.png` });
    console.log("✓ live-match");
  } catch (e) {
    console.warn("• live-match skipped:", e.message);
  }

  cleanup();
  clearTimeout(hardTimer);
  console.log(`\n✓ Baseline saved → ${OUT}`);
  process.exit(0);
}

main().catch((e) => {
  console.error("✗ Baseline failed:", e.message);
  cleanup();
  process.exit(1);
});
