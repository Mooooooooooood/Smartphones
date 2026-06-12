"use client";

import { useSyncExternalStore } from "react";

/**
 * Optional haptic feedback via navigator.vibrate. Fails silently where
 * unsupported (e.g. iOS Safari). On by default; toggleable in Settings.
 */
const KEY = "rang-haptics";
const listeners = new Set<() => void>();

export function hapticsSupported(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

export function isHapticsOn(): boolean {
  if (typeof localStorage === "undefined") return true;
  return localStorage.getItem(KEY) !== "off";
}

export function setHapticsOn(on: boolean): void {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l());
}

export function useHapticsOn(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    isHapticsOn,
    () => true,
  );
}

export type HapticEvent = "tap" | "correct" | "wrong" | "chest" | "match";

/** Vibration pattern (ms) per event — pure, exported for testing. */
export const HAPTIC_PATTERNS: Record<HapticEvent, number | number[]> = {
  tap: 10,
  correct: [12, 40, 12],
  wrong: [40, 30, 40],
  chest: [10, 30, 10, 30, 25],
  match: [20, 50, 30],
};

/** Fire a haptic if supported and enabled. */
export function vibrate(event: HapticEvent): void {
  if (!hapticsSupported() || !isHapticsOn()) return;
  try {
    navigator.vibrate(HAPTIC_PATTERNS[event]);
  } catch {
    /* ignore */
  }
}
