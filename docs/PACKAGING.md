# Packaging Pawnquest as a native app (Capacitor)

Pawnquest is a fully client-side PWA, so it can be shipped three ways from the
same codebase:

1. **Installable PWA** — host the normal server build (`npm run build && npm start`)
   or any static host; users "Add to Home Screen". Works today.
2. **iOS app** (App Store / TestFlight) — Capacitor shell around the static export.
3. **Android app** (Play Store) — same, via Android Studio / Gradle.

This doc covers 2 and 3. The web layer is identical to the PWA; Capacitor only
provides the native wrapper, splash, and store presence.

## Prerequisites

- **Both:** Node 20.9+, the repo installed (`npm install` — Capacitor packages
  are already in `devDependencies`).
- **iOS:** macOS + Xcode 15+ + CocoaPods (`sudo gem install cocoapods`).
- **Android:** Android Studio + a JDK (17+) and the Android SDK.

These native toolchains cannot run in CI/cloud sandboxes — run the platform
steps on a developer machine.

## 1. Build the web assets

Capacitor serves a **static export**, not a Node server. Produce it with:

```bash
npm run build:static      # → BUILD_STATIC=1 next build, emits ./out
```

`out/` is a complete static site (48 pre-rendered pages, the service worker,
the manifest, and all icons). `next.config.ts` switches to `output: "export"`
only when `BUILD_STATIC=1`, so the normal `npm run build` / `npm start` PWA
flow is unchanged.

## 2. Add the native platforms (one-time)

```bash
npx cap add ios
npx cap add android
```

This scaffolds the `ios/` and `android/` projects (both gitignored — they are
generated, not source). `capacitor.config.ts` already points `webDir` at `out`
and sets `appId: app.pawnquest`, `appName: Pawnquest`, and the navy background.

## 3. Sync and open

Every time the web app changes, rebuild and copy the assets into the native
projects:

```bash
npm run cap:sync          # build:static + npx cap sync
```

Then open the platform IDE to run, sign, and archive:

```bash
npx cap open ios          # Xcode  → run on simulator/device, Archive → App Store
npx cap open android      # Android Studio → run / generate signed bundle
```

## 4. Store assets

- App icon: reuse `public/icon-512.png` / `public/maskable-icon-512.png`.
- Screenshots: `public/screenshots/*.png` (regenerate with `npm run shots`).
- Store copy: `docs/PRESS.md`.

## Notes

- **Offline:** the bundled service worker (`public/sw.js`) still precaches the
  shell, so the app works offline inside the native wrapper too.
- **Storage:** all progress lives in IndexedDB (Dexie) on-device — no accounts,
  no network calls, nothing to migrate.
- **Deep links / routing:** `trailingSlash: true` is set for the static target
  so each route resolves as `route/index.html` under the native file server.
- **Status bar / safe areas:** the layout already honours
  `env(safe-area-inset-*)`; `contentInset: "always"` is set for iOS.
