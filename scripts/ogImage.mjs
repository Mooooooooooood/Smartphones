/**
 * Open Graph / social-card generator → public/og-image.png (1200×630).
 *
 * Renders a brand card (navy arcade gradient + pixel frame + the real in-app
 * phone screenshots) with Playwright and screenshots it at exactly 1200×630.
 * No dev server needed — the screenshots are inlined as data URLs.
 *
 * Run after `npm run shots` (needs public/screenshots/*.png).
 * Usage: `node scripts/ogImage.mjs`  (or `npm run og`)
 */
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { chromium } from "playwright";

const CHROME = process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const OUT = "public/og-image.png";
const SHOTS = ["home", "puzzles", "play"];

for (const name of SHOTS) {
  if (!existsSync(`public/screenshots/${name}.png`)) {
    console.error(`✗ Missing public/screenshots/${name}.png — run \`npm run shots\` first.`);
    process.exit(1);
  }
}
mkdirSync("public", { recursive: true });

const dataUrl = (name) =>
  `data:image/png;base64,${readFileSync(`public/screenshots/${name}.png`).toString("base64")}`;
const [home, puzzles, play] = SHOTS.map(dataUrl);

const html = `<!doctype html><html><head><meta charset="utf-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Pixelify+Sans:wght@400;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  #card {
    width: 1200px; height: 630px; position: relative; overflow: hidden;
    background: radial-gradient(120% 140% at 18% 0%, #2c3c8a 0%, #18204f 45%, #0c1230 100%);
    font-family: 'Pixelify Sans', ui-sans-serif, system-ui;
  }
  /* pixel frame */
  #frame { position: absolute; inset: 18px; border: 6px solid #0c1230;
    box-shadow: inset 0 0 0 3px #f7bd3f, 0 0 0 3px #1a2350; border-radius: 10px; }
  .rivet { position: absolute; width: 12px; height: 12px; background: #f7bd3f;
    border: 2px solid #0c1230; border-radius: 2px; }
  .rivet.tl { top: 30px; left: 30px; } .rivet.tr { top: 30px; right: 30px; }
  .rivet.bl { bottom: 30px; left: 30px; } .rivet.br { bottom: 30px; right: 30px; }
  .left { position: absolute; left: 70px; top: 122px; width: 560px; }
  .eyebrow { font-family: 'Press Start 2P'; font-size: 15px; color: #ffd76b;
    letter-spacing: 1px; margin-bottom: 26px; }
  .wordmark { font-family: 'Press Start 2P'; font-size: 64px; line-height: 1.05; color: #eef3ff;
    text-shadow: 0 4px 0 #0c1230; }
  .wordmark span { color: #f7bd3f; }
  .tag { font-size: 33px; color: #eef3ff; margin-top: 26px; font-weight: 600; }
  .features { font-size: 22px; color: #ffd76b; margin-top: 18px; letter-spacing: .5px; }
  .pill { display: inline-block; margin-top: 30px; font-family: 'Press Start 2P'; font-size: 12px;
    color: #04061a; background: #f7bd3f; padding: 11px 16px; border: 3px solid #0c1230; border-radius: 6px; }
  .right { position: absolute; right: -10px; top: 0; bottom: 0; width: 560px; }
  .phone { position: absolute; height: 470px; border: 5px solid #0c1230; border-radius: 18px;
    box-shadow: 0 18px 40px rgba(4,6,26,.55); background: #121a3e; }
  .p1 { top: 78px; right: 360px; transform: rotate(-9deg); z-index: 1; }
  .p2 { top: 58px; right: 180px; transform: rotate(-2deg); z-index: 3; height: 500px; }
  .p3 { top: 86px; right: 6px;  transform: rotate(7deg);  z-index: 2; }
</style></head>
<body><div id="card">
  <div id="frame"></div>
  <span class="rivet tl"></span><span class="rivet tr"></span>
  <span class="rivet bl"></span><span class="rivet br"></span>
  <div class="left">
    <div class="eyebrow">&#9733; RETRO CHESS QUEST</div>
    <h1 class="wordmark">Pawn<span>quest</span></h1>
    <p class="tag">Learn chess as a pixel quest.</p>
    <div class="features">Academy &middot; Daily Puzzles &middot; Battles</div>
    <div class="pill">&#9759; WORKS OFFLINE &middot; NO ADS</div>
  </div>
  <div class="right">
    <img class="phone p1" src="${home}"/>
    <img class="phone p3" src="${play}"/>
    <img class="phone p2" src="${puzzles}"/>
  </div>
</div></body></html>`;

const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
try {
  await page.evaluate(() => document.fonts.ready);
} catch { /* fonts best-effort */ }
await page.waitForTimeout(600);
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
console.log(`✓ OG image saved → ${OUT}`);
process.exit(0);
