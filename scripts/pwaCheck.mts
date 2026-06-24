/**
 * PWA / offline packaging checks (Sprint 11 QA).
 *
 * Verifies the web manifest has the required fields, the icon PNG files exist,
 * and the backup validator accepts a good shape while rejecting junk.
 * Run with:  npm run test:pwa
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateBackup, BACKUP_APP, BACKUP_TABLES } from "../src/data/backupSchema.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

let pass = 0;
let fail = 0;

function check(desc: string, got: unknown, want: unknown) {
  if (got === want) {
    pass++;
  } else {
    fail++;
    console.error(`✗ ${desc} — expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);
  }
}

// ---- Manifest ----
const manifest = JSON.parse(readFileSync(join(root, "public/manifest.webmanifest"), "utf8"));
check("manifest name is Pawnquest", manifest.name, "Pawnquest");
check("manifest short_name is Pawnquest", manifest.short_name, "Pawnquest");
check("manifest has description", typeof manifest.description === "string" && manifest.description.length > 0, true);
check("manifest start_url is /", manifest.start_url, "/");
check("manifest scope is /", manifest.scope, "/");
check("manifest display is standalone", manifest.display, "standalone");
check("manifest orientation is portrait", manifest.orientation, "portrait");
check("manifest has theme_color", typeof manifest.theme_color === "string", true);
check("manifest has background_color", typeof manifest.background_color === "string", true);
check("manifest icons is a non-empty array", Array.isArray(manifest.icons) && manifest.icons.length > 0, true);

const icons: { src: string; sizes: string; purpose?: string }[] = manifest.icons;
check("manifest has a 192x192 icon", icons.some((i) => i.sizes === "192x192"), true);
check("manifest has a 512x512 icon", icons.some((i) => i.sizes === "512x512"), true);
check(
  "manifest has a maskable icon",
  icons.some((i) => (i.purpose ?? "").split(/\s+/).includes("maskable")),
  true,
);

// No old project name anywhere in the manifest.
check(
  "manifest free of 'Smartphones' naming",
  /smartphones/i.test(JSON.stringify(manifest)),
  false,
);

// ---- Store screenshots (App-Store / installable PWA listing) ----
const shots: { src: string; sizes: string; form_factor?: string }[] = manifest.screenshots ?? [];
check("manifest has a non-empty screenshots array", Array.isArray(shots) && shots.length > 0, true);
check("every screenshot is form_factor narrow", shots.length > 0 && shots.every((s) => s.form_factor === "narrow"), true);
for (const s of shots) {
  const rel = "public" + s.src;
  const abs = join(root, rel);
  check(`screenshot file exists & non-empty: ${s.src}`, existsSync(abs) && statSync(abs).size > 0, true);
}

// ---- Social / Open Graph card ----
const ogAbs = join(root, "public/og-image.png");
check("og-image.png exists & non-empty", existsSync(ogAbs) && statSync(ogAbs).size > 0, true);
const layout = readFileSync(join(root, "src/app/layout.tsx"), "utf8");
check("layout sets metadataBase", layout.includes("metadataBase"), true);
check("layout references /og-image.png", layout.includes("/og-image.png"), true);

// ---- Icon files ----
const ICON_FILES = [
  "public/icon-192.png",
  "public/icon-512.png",
  "public/apple-touch-icon.png",
  "public/maskable-icon-512.png",
];
for (const rel of ICON_FILES) {
  const abs = join(root, rel);
  const ok = existsSync(abs) && statSync(abs).size > 0;
  check(`icon file exists & non-empty: ${rel}`, ok, true);
}

// ---- Service worker + offline shell ----
check("service worker file exists", existsSync(join(root, "public/sw.js")), true);
const sw = existsSync(join(root, "public/sw.js")) ? readFileSync(join(root, "public/sw.js"), "utf8") : "";
check("service worker precaches /offline", sw.includes('"/offline"'), true);
check("offline route exists", existsSync(join(root, "src/app/offline/page.tsx")), true);

// ---- Backup validation ----
const goodTables = Object.fromEntries(BACKUP_TABLES.map((t) => [t, []]));
const good = { app: BACKUP_APP, version: 1, exportedAt: Date.now(), tables: goodTables };
check("validateBackup accepts a good backup", validateBackup(good), true);
check("validateBackup rejects null", validateBackup(null), false);
check("validateBackup rejects a string", validateBackup("nope"), false);
check("validateBackup rejects wrong app marker", validateBackup({ ...good, app: "smartphones" }), false);
check("validateBackup rejects missing tables", validateBackup({ app: BACKUP_APP, version: 1, exportedAt: 0 }), false);
check(
  "validateBackup rejects a non-array table",
  validateBackup({ ...good, tables: { ...goodTables, profile: 123 } }),
  false,
);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log("✓ All PWA checks passed");
