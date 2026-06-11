import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const out = "visual-audit/rang";
mkdirSync(out, { recursive: true });
const base = "http://localhost:3010";
const routes = [
  ["home", "/"],
  ["academy", "/academy"],
  ["puzzles", "/puzzles"],
  ["play", "/play"],
  ["profile", "/profile"],
];

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox"],
});
for (const theme of ["light", "dark"]) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    colorScheme: theme,
  });
  await ctx.addInitScript((t) => { try { localStorage.setItem("tabiya-theme", t); } catch {} }, theme);
  const page = await ctx.newPage();
  for (const [name, path] of routes) {
    await page.goto(base + path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1400);
    await page.screenshot({ path: `${out}/${name}-${theme}.png`, fullPage: true });
    console.log("shot", name, theme);
  }
  await ctx.close();
}
await browser.close();
console.log("done");
