"use client";

import { useSyncExternalStore } from "react";
import type { BuddyPiece } from "@/components/pixel/PixelSprite";

/**
 * Local player identity — name, chosen avatar piece, and side. Device-local
 * (localStorage + useSyncExternalStore), mirroring lib/playerColor.ts. Piece
 * unlocks are derived from progress (see content/pieceUnlocks.ts); this only
 * stores the *chosen* piece.
 */
export type PlayerSide = "white" | "black";

const NAME_KEY = "rang-player-name";
const PIECE_KEY = "rang-player-piece";
const SIDE_KEY = "rang-player-side";
const PIECES: BuddyPiece[] = ["pawn", "knight", "bishop", "rook", "queen", "king"];

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/* ---- name ---- */
export function getPlayerName(): string {
  if (typeof localStorage === "undefined") return "";
  return localStorage.getItem(NAME_KEY) ?? "";
}
/** Name for display — falls back to "Player" when unset. */
export function displayName(): string {
  const n = getPlayerName().trim();
  return n.length ? n : "Player";
}
export function setPlayerName(name: string): void {
  try { localStorage.setItem(NAME_KEY, name.slice(0, 14)); } catch { /* ignore */ }
  emit();
}
export function usePlayerName(): string {
  return useSyncExternalStore(subscribe, getPlayerName, () => "");
}

/* ---- piece ---- */
export function getPlayerPiece(): BuddyPiece {
  if (typeof localStorage === "undefined") return "pawn";
  const v = localStorage.getItem(PIECE_KEY);
  return PIECES.includes(v as BuddyPiece) ? (v as BuddyPiece) : "pawn";
}
export function setPlayerPiece(piece: BuddyPiece): void {
  try { localStorage.setItem(PIECE_KEY, piece); } catch { /* ignore */ }
  emit();
}
export function usePlayerPiece(): BuddyPiece {
  return useSyncExternalStore(subscribe, getPlayerPiece, () => "pawn");
}

/* ---- side ---- */
export function getPlayerSide(): PlayerSide {
  if (typeof localStorage === "undefined") return "white";
  return localStorage.getItem(SIDE_KEY) === "black" ? "black" : "white";
}
export function setPlayerSide(side: PlayerSide): void {
  try { localStorage.setItem(SIDE_KEY, side); } catch { /* ignore */ }
  emit();
}
export function usePlayerSide(): PlayerSide {
  return useSyncExternalStore(subscribe, getPlayerSide, () => "white");
}
