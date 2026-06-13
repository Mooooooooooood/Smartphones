"use client";

import { useSyncExternalStore } from "react";

/**
 * Selectable board skins. Boards are 100% CSS-variable driven (boardTheme.ts),
 * so a skin just overrides --board-light / --board-dark (+ coord colours) on
 * :root. Stored device-local (localStorage). "classic" = the default palette.
 */
export interface BoardSkin {
  id: string;
  label: string;
  light: string;
  dark: string;
  coord: string; // notation colour (used for both square shades)
  /** Shop price in coins (0 = free/default). */
  price: number;
}

export const BOARD_SKINS: BoardSkin[] = [
  { id: "classic", label: "Classic", light: "#dfe7fb", dark: "#7e9ee6", coord: "rgba(18,26,62,0.55)", price: 0 },
  { id: "forest", label: "Forest", light: "#e9f0d6", dark: "#7fa564", coord: "rgba(28,48,20,0.55)", price: 150 },
  { id: "night", label: "Night", light: "#5a6796", dark: "#2f3a63", coord: "rgba(220,228,255,0.55)", price: 200 },
  { id: "marble", label: "Marble", light: "#efe9df", dark: "#b9ad97", coord: "rgba(50,40,30,0.5)", price: 250 },
  { id: "candy", label: "Candy", light: "#ffe5f1", dark: "#f49ac0", coord: "rgba(90,20,55,0.5)", price: 300 },
];

const KEY = "rang-board-skin";
const listeners = new Set<() => void>();

export function getBoardSkinId(): string {
  if (typeof localStorage === "undefined") return "classic";
  const v = localStorage.getItem(KEY);
  return BOARD_SKINS.some((s) => s.id === v) ? (v as string) : "classic";
}

/** Apply a skin's palette to :root (or clear it for "classic"). */
export function applyBoardSkin(id: string): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const skin = BOARD_SKINS.find((s) => s.id === id);
  if (!skin || skin.id === "classic") {
    root.style.removeProperty("--board-light");
    root.style.removeProperty("--board-dark");
    root.style.removeProperty("--board-coord-on-dark");
    root.style.removeProperty("--board-coord-on-light");
    return;
  }
  root.style.setProperty("--board-light", skin.light);
  root.style.setProperty("--board-dark", skin.dark);
  root.style.setProperty("--board-coord-on-dark", skin.coord);
  root.style.setProperty("--board-coord-on-light", skin.coord);
}

export function setBoardSkinId(id: string): void {
  try { localStorage.setItem(KEY, id); } catch { /* ignore */ }
  applyBoardSkin(id);
  listeners.forEach((l) => l());
}

export function useBoardSkinId(): string {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    getBoardSkinId,
    () => "classic",
  );
}
