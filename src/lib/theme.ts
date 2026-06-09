"use client";

/** Theme preference handling, persisted in localStorage and applied via a
 *  `dark` class on <html>. Light = bright cartoon, dark = soft cartoon night. */

export type Theme = "light" | "dark" | "system";

export const THEME_KEY = "tabiya-theme";

export function getStoredTheme(): Theme {
  if (typeof localStorage === "undefined") return "system";
  const t = localStorage.getItem(THEME_KEY);
  return t === "light" || t === "dark" || t === "system" ? t : "system";
}

export function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function resolveTheme(t: Theme): "light" | "dark" {
  return t === "system" ? (systemPrefersDark() ? "dark" : "light") : t;
}

export function applyTheme(t: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolveTheme(t) === "dark");
}

/* ---- tiny pub/sub so the toggle re-renders on same-tab changes ---- */
const listeners = new Set<() => void>();

export function setTheme(t: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {
    /* storage unavailable */
  }
  applyTheme(t);
  listeners.forEach((l) => l());
}

/** Subscribe to theme changes (click, OS scheme change, other tabs). */
export function subscribeTheme(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = () => {
    applyTheme(getStoredTheme());
    cb();
  };
  const mq =
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : null;
  const onScheme = () => {
    if (getStoredTheme() === "system") applyTheme("system");
    cb();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  mq?.addEventListener?.("change", onScheme);
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
    mq?.removeEventListener?.("change", onScheme);
  };
}

/** Inline script (stringified) that applies the saved theme before paint. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_KEY}')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;
