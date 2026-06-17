"use client";

import { useSyncExternalStore } from "react";

/**
 * Selectable board skins. Boards are 100% CSS-variable driven (boardTheme.ts),
 * so a skin just overrides --board-light / --board-dark (+ coord colours) on
 * :root. Stored device-local (localStorage). "classic" = the default palette.
 */
export type Rarity = "epic" | "legendary";

export interface BoardSkin {
  id: string;
  label: string;
  light: string;
  dark: string;
  coord: string; // notation colour (used for both square shades)
  /** Shop price in coins (0 = free/default). */
  price: number;
  /** Rarity tier for premium skins (shown as a shop badge). */
  rarity?: Rarity;
}

/**
 * Legendary material boards. "classic" stays the free default; the rest are
 * premium cosmetics themed as gold/diamond/void/grass/snow/lava.
 */
export const BOARD_SKINS: BoardSkin[] = [
  { id: "classic", label: "Classic", light: "#dfe7fb", dark: "#7e9ee6", coord: "rgba(18,26,62,0.55)", price: 0 },
  { id: "grass", label: "Grass", light: "#e6f4c8", dark: "#5fa83f", coord: "rgba(24,52,16,0.6)", price: 200, rarity: "epic" },
  { id: "snow", label: "Snow", light: "#f4fbff", dark: "#b6d4ea", coord: "rgba(30,60,96,0.55)", price: 250, rarity: "epic" },
  { id: "gold", label: "Gold", light: "#fff2c2", dark: "#d6a32a", coord: "rgba(74,48,8,0.6)", price: 420, rarity: "legendary" },
  { id: "diamond", label: "Diamond", light: "#eaf7ff", dark: "#7cc0ec", coord: "rgba(20,60,96,0.55)", price: 480, rarity: "legendary" },
  { id: "lava", label: "Lava", light: "#ffb066", dark: "#7a1f12", coord: "rgba(255,228,180,0.7)", price: 460, rarity: "legendary" },
  { id: "void", label: "Void", light: "#33285e", dark: "#150f30", coord: "rgba(200,180,255,0.7)", price: 500, rarity: "legendary" },
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
