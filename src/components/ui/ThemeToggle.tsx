"use client";

import { useSyncExternalStore } from "react";
import {
  getStoredTheme,
  resolveTheme,
  setTheme,
  subscribeTheme,
  type Theme,
} from "@/lib/theme";

const OPTIONS: { value: Theme; label: string; glyph: string }[] = [
  { value: "light", label: "Light", glyph: "☀" },
  { value: "dark", label: "Dark", glyph: "☾" },
  { value: "system", label: "Auto", glyph: "◐" },
];

function useTheme(): Theme {
  return useSyncExternalStore(
    subscribeTheme,
    () => getStoredTheme(),
    () => "system",
  );
}

/** Theme switcher. `compact` shows a single sun/moon button that flips
 *  light↔dark; otherwise a 3-way segmented control (Light / Dark / Auto). */
export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const theme = useTheme();

  if (compact) {
    const isDark = resolveTheme(theme) === "dark";
    return (
      <button
        type="button"
        aria-label="Toggle dark mode"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-panel text-lg text-cream shadow-[0_3px_0_0_var(--color-line)] active:translate-y-0.5"
      >
        {isDark ? "☾" : "☀"}
      </button>
    );
  }

  return (
    <div className="flex w-full max-w-[260px] gap-1 rounded-full border border-line bg-ink2 p-1">
      {OPTIONS.map((o) => {
        const active = theme === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => setTheme(o.value)}
            className={`flex flex-1 items-center justify-center gap-1 rounded-full px-2 py-2 text-xs font-semibold transition-colors ${
              active ? "bg-brass text-[color:var(--color-on-accent)]" : "text-muted"
            }`}
          >
            <span aria-hidden>{o.glyph}</span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
