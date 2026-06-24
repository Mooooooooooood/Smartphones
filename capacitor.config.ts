import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor wraps the static Next.js export (`out/`) in a native iOS/Android
 * shell. Produce the web assets first with `npm run build:static`, then
 * `npx cap sync`. Full runbook in docs/PACKAGING.md.
 */
const config: CapacitorConfig = {
  appId: "app.pawnquest",
  appName: "Pawnquest",
  webDir: "out",
  backgroundColor: "#080d24",
  ios: {
    contentInset: "always",
    backgroundColor: "#080d24",
  },
  android: {
    backgroundColor: "#080d24",
  },
};

export default config;
