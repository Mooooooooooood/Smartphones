"use client";

import { useSyncExternalStore } from "react";

/**
 * Ambient background music — a single looped <audio> element playing the
 * generated chiptune at public/audio/ambient.wav. Its volume is set directly on
 * the element, fully independent of the SFX master gain in sound.ts. Defaults
 * OFF (autoplay etiquette); starts only after the user enables it / a gesture.
 * Same localStorage + useSyncExternalStore shape as sound.ts.
 */
const ON_KEY = "rang-music";
const VOL_KEY = "rang-music-volume";
const DEFAULT_VOLUME = 0.3;
const SRC = "/audio/ambient.wav";

const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }
function subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb); }

export function isMusicOn(): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(ON_KEY) === "on"; // default OFF
}

export function getMusicVolume(): number {
  if (typeof localStorage === "undefined") return DEFAULT_VOLUME;
  const raw = localStorage.getItem(VOL_KEY);
  if (raw === null) return DEFAULT_VOLUME;
  const v = Number(raw);
  return Number.isFinite(v) && v >= 0 && v <= 1 ? v : DEFAULT_VOLUME;
}

let el: HTMLAudioElement | null = null;
function ensureAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!el) {
    el = new Audio(SRC);
    el.loop = true;
    el.preload = "auto";
    el.volume = getMusicVolume();
    el.setAttribute("aria-hidden", "true");
    try { document.body.appendChild(el); } catch { /* SSR / no body */ }
  }
  return el;
}

/** Start playback if music is enabled. Rejects silently until a user gesture. */
export function playMusic(): void {
  if (!isMusicOn()) return;
  const a = ensureAudio();
  if (!a) return;
  a.volume = getMusicVolume();
  a.play().catch(() => { /* autoplay blocked until a gesture */ });
}

export function pauseMusic(): void {
  if (el) { try { el.pause(); } catch { /* ignore */ } }
}

export function setMusicOn(on: boolean): void {
  try { localStorage.setItem(ON_KEY, on ? "on" : "off"); } catch { /* ignore */ }
  if (on) playMusic(); else pauseMusic();
  emit();
}

export function setMusicVolume(v: number): void {
  const clamped = Math.max(0, Math.min(1, v));
  try { localStorage.setItem(VOL_KEY, String(clamped)); } catch { /* ignore */ }
  if (el) el.volume = clamped;
  emit();
}

export function useMusicOn(): boolean {
  return useSyncExternalStore(subscribe, isMusicOn, () => false);
}
export function useMusicVolume(): number {
  return useSyncExternalStore(subscribe, getMusicVolume, () => DEFAULT_VOLUME);
}
