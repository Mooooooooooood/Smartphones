"use client";

import { useSyncExternalStore } from "react";

/** The player's chosen avatar tint, persisted in localStorage (no DB migration). */
export type PlayerColorId = "gold" | "red" | "blue" | "green" | "purple";

export const PLAYER_COLORS: { id: PlayerColorId; label: string; swatch: string }[] = [
  { id: "gold", label: "Gold", swatch: "#ffd24a" },
  { id: "red", label: "Crimson", swatch: "#ff5468" },
  { id: "blue", label: "Azure", swatch: "#4d8dff" },
  { id: "green", label: "Jade", swatch: "#45d36c" },
  { id: "purple", label: "Amethyst", swatch: "#8a6fe0" },
];

const KEY = "rang-player-color";
const listeners = new Set<() => void>();

export function getPlayerColor(): PlayerColorId {
  if (typeof localStorage === "undefined") return "gold";
  const v = localStorage.getItem(KEY);
  return PLAYER_COLORS.some((c) => c.id === v) ? (v as PlayerColorId) : "gold";
}

export function setPlayerColor(id: PlayerColorId): void {
  try { localStorage.setItem(KEY, id); } catch { /* storage unavailable */ }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Reactive accessor for the player's avatar tint. */
export function usePlayerColor(): PlayerColorId {
  return useSyncExternalStore(subscribe, getPlayerColor, () => "gold");
}
