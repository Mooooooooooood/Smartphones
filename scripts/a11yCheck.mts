/**
 * Accessibility + production-packaging checks (Sprint 28 QA).
 *
 * Static guards so the 1.0 hardening can't silently regress:
 *  - a focus-visible ring, skip link, sr-only, and reduced-motion support
 *    are present in the global stylesheet + layout;
 *  - meaningful <Image> usage stays export-safe (unoptimized);
 *  - the Capacitor static-export target and packaging scripts are wired up.
 * Run with:  npm run test:a11y
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");

let pass = 0;
let fail = 0;
function check(desc: string, cond: boolean) {
  if (cond) pass++;
  else {
    fail++;
    console.error(`✗ ${desc}`);
  }
}

// ---- Global stylesheet: focus, skip link, sr-only, reduced motion ----
const css = read("src/app/globals.css");
check("globals has a :focus-visible ring", /:focus-visible\s*\{[^}]*outline/.test(css));
check("globals defines .sr-only", /\.sr-only\s*\{/.test(css));
check("globals defines .skip-link", /\.skip-link\s*\{/.test(css));
check("skip link reveals itself on :focus", /\.skip-link:focus\s*\{/.test(css));
check("globals honours prefers-reduced-motion", /@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(css));
check("reduced-motion disables animations", /prefers-reduced-motion[\s\S]*animation:\s*none/.test(css));

// ---- Layout: skip link + focusable main landmark ----
const layout = read("src/app/layout.tsx");
check('layout renders a skip-to-content link to #main', /href="#main"[^>]*className="skip-link"/.test(layout));
check('layout has <main id="main">', /<main[^>]*id="main"/.test(layout));
check("layout main is programmatically focusable", /<main[^>]*tabIndex=\{-1\}/.test(layout));
check("html element declares a lang", /<html[^>]*lang="en"/.test(layout));

// ---- Labeled controls (regression guards for previously-bare inputs) ----
check("Onboarding name input has an accessible name", /aria-label="Hero name"/.test(read("src/components/Onboarding.tsx")));
check("NameEditModal input has an accessible name", /aria-label="Player name"/.test(read("src/components/pixel/NameEditModal.tsx")));
check("Modal supports Escape-to-close", /e\.key === "Escape"/.test(read("src/components/ui/Modal.tsx")));

// ---- Export safety: every <Image> stays unoptimized (no Node optimizer) ----
function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(join(root, dir))) {
    const rel = `${dir}/${name}`;
    if (statSync(join(root, rel)).isDirectory()) out.push(...walk(rel));
    else if (name.endsWith(".tsx")) out.push(rel);
  }
  return out;
}
const tsx = walk("src");
const badImages = tsx.filter((f) => {
  const src = read(f);
  return /<Image\b/.test(src) && /<Image\b(?![^>]*unoptimized)[^>]*\/?>/.test(src);
});
check(`every <Image> is unoptimized (export-safe) — offenders: ${badImages.join(", ") || "none"}`, badImages.length === 0);

// ---- Capacitor static-export packaging ----
const nextCfg = read("next.config.ts");
check('next.config has a BUILD_STATIC export branch', /BUILD_STATIC/.test(nextCfg) && /output:\s*"export"/.test(nextCfg));
check("static target disables image optimization", /unoptimized:\s*true/.test(nextCfg));

const cap = read("capacitor.config.ts");
check('capacitor appName is Pawnquest', /appName:\s*"Pawnquest"/.test(cap));
check('capacitor webDir is the export dir "out"', /webDir:\s*"out"/.test(cap));
check("capacitor appId is set", /appId:\s*"[^"]+"/.test(cap));

const pkg = JSON.parse(read("package.json"));
check("package has a build:static script", typeof pkg.scripts?.["build:static"] === "string");
check("package has a cap:sync script", typeof pkg.scripts?.["cap:sync"] === "string");
check("package has a test:a11y script", typeof pkg.scripts?.["test:a11y"] === "string");
check("Capacitor cli is a dependency", !!(pkg.devDependencies?.["@capacitor/cli"] || pkg.dependencies?.["@capacitor/cli"]));

// ---- ios/android native dirs are gitignored (generated, not source) ----
const ignore = read(".gitignore");
check("/ios/ is gitignored", /^\/ios\/?$/m.test(ignore));
check("/android/ is gitignored", /^\/android\/?$/m.test(ignore));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log("✓ All accessibility & packaging checks passed");
