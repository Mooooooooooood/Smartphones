"use client";

import { useSyncExternalStore } from "react";

/** The player's chosen avatar tint, persisted in localStorage (no DB migration). */
export type PlayerColorId =
  | "gold" | "red" | "blue" | "green" | "purple"
  | "ember" | "frost" | "void" | "mint";

export interface PlayerColorDef {
  id: PlayerColorId;
  label: string;
  swatch: string;
  /** Shop price in coins (0 = free, available from the start). */
  price: number;
}

export const PLAYER_COLORS: PlayerColorDef[] = [
  { id: "gold", label: "Gold", swatch: "#ffd24a", price: 0 },
  { id: "red", label: "Crimson", swatch: "#ff5468", price: 0 },
  { id: "blue", label: "Azure", swatch: "#4d8dff", price: 0 },
  { id: "green", label: "Jade", swatch: "#45d36c", price: 0 },
  { id: "purple", label: "Amethyst", swatch: "#8a6fe0", price: 0 },
  // Premium — bought + equipped from the Shop.
  { id: "ember", label: "Ember", swatch: "#ff7a2f", price: 120 },
  { id: "frost", label: "Frost", swatch: "#5fd6e8", price: 140 },
  { id: "mint", label: "Mint", swatch: "#3fd6a0", price: 160 },
  { id: "void", label: "Void", swatch: "#6a4fa0", price: 200 },
];

const FREE_IDS = new Set(PLAYER_COLORS.filter((c) => c.price === 0).map((c) => c.id));

/** Shop item id for a colour (matches the owned-set key). */
export function colorItemId(id: PlayerColorId): string {
  return `color-${id}`;
}

/** A colour is usable if it's free or its shop item is owned. */
export function isColorOwned(id: PlayerColorId, owned: Record<string, true>): boolean {
  return FREE_IDS.has(id) || Boolean(owned[colorItemId(id)]);
}

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
