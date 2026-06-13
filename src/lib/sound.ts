"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny generated sound-effects service. No external assets — every sound is a
 * short Web Audio envelope routed through a master gain (the volume slider).
 * Sound is ON at low volume by default; the AudioContext is unlocked on the
 * first user gesture (iOS autoplay-safe) via primeOnFirstGesture().
 */
const KEY = "rang-sound";
const VOL_KEY = "rang-volume";
const MIG_KEY = "rang-sound-mig";
const DEFAULT_VOLUME = 0.4;
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }
function subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb); }

/**
 * One-time migration: earlier builds defaulted sound OFF and may have written
 * "off". Clear that once so returning users aren't silently muted; users who
 * deliberately mute later just re-set "off" (and the flag stays set).
 */
function migrate() {
  if (typeof localStorage === "undefined") return;
  if (localStorage.getItem(MIG_KEY)) return;
  try {
    if (localStorage.getItem(KEY) === "off") localStorage.removeItem(KEY);
    localStorage.setItem(MIG_KEY, "1");
  } catch { /* ignore */ }
}

export function isSoundOn(): boolean {
  if (typeof localStorage === "undefined") return true;
  return localStorage.getItem(KEY) !== "off"; // default ON
}
export function setSoundOn(on: boolean): void {
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* ignore */ }
  if (on) prime();
  emit();
}
export function useSoundOn(): boolean {
  return useSyncExternalStore(subscribe, isSoundOn, () => true);
}

export function getVolume(): number {
  if (typeof localStorage === "undefined") return DEFAULT_VOLUME;
  const raw = localStorage.getItem(VOL_KEY);
  if (raw === null) return DEFAULT_VOLUME;
  const v = Number(raw);
  return Number.isFinite(v) && v >= 0 && v <= 1 ? v : DEFAULT_VOLUME;
}
export function setVolume(v: number): void {
  const clamped = Math.max(0, Math.min(1, v));
  try { localStorage.setItem(VOL_KEY, String(clamped)); } catch { /* ignore */ }
  if (master) master.gain.value = clamped;
  emit();
}
export function useVolume(): number {
  return useSyncExternalStore(subscribe, getVolume, () => DEFAULT_VOLUME);
}

/* ---- Web Audio ---- */
type Ctx = AudioContext;
let ctx: Ctx | null = null;
let master: GainNode | null = null;

function unlockSilently(c: Ctx) {
  // A 1-sample silent buffer fully unlocks the iOS audio hardware so the very
  // next real sound is audible.
  try {
    const src = c.createBufferSource();
    src.buffer = c.createBuffer(1, 1, c.sampleRate);
    src.connect(c.destination);
    src.start(0);
  } catch { /* ignore */ }
}

function ac(): Ctx | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = getVolume();
    master.connect(ctx.destination);
    unlockSilently(ctx);
  }
  if (ctx.state === "suspended") {
    const c = ctx;
    c.resume().then(() => unlockSilently(c)).catch(() => {});
  }
  return ctx;
}

/** Warm the context after a user gesture so later sounds are instant. */
export function prime(): void {
  ac();
}

let primed = false;
/** Register a one-time global gesture listener that unlocks audio (iOS). */
export function primeOnFirstGesture(): void {
  if (typeof window === "undefined" || primed) return;
  primed = true;
  const unlock = () => { prime(); };
  window.addEventListener("pointerdown", unlock, { once: true, passive: true });
  window.addEventListener("touchstart", unlock, { once: true, passive: true });
  window.addEventListener("keydown", unlock, { once: true });
}

// Register the gesture primer + run migration as soon as this module loads
// (it's imported very early via feedback.ts → PixelButton), so audio is ready
// before the first tap regardless of component mount timing.
if (typeof window !== "undefined") {
  migrate();
  primeOnFirstGesture();
}

export type Sfx = "tap" | "correct" | "wrong" | "chest" | "win" | "lose";

/** Pure note spec per effect — exported for testing. */
export const SFX_NOTES: Record<Sfx, { freq: number; dur: number; type: OscillatorType }[]> = {
  tap: [{ freq: 523, dur: 0.11, type: "square" }],
  correct: [
    { freq: 660, dur: 0.11, type: "square" },
    { freq: 880, dur: 0.16, type: "square" },
  ],
  wrong: [
    { freq: 200, dur: 0.12, type: "sawtooth" },
    { freq: 150, dur: 0.14, type: "sawtooth" },
  ],
  chest: [
    { freq: 523, dur: 0.08, type: "triangle" },
    { freq: 659, dur: 0.08, type: "triangle" },
    { freq: 784, dur: 0.14, type: "triangle" },
  ],
  win: [
    { freq: 523, dur: 0.09, type: "square" },
    { freq: 659, dur: 0.09, type: "square" },
    { freq: 880, dur: 0.18, type: "square" },
  ],
  lose: [
    { freq: 330, dur: 0.12, type: "sawtooth" },
    { freq: 247, dur: 0.18, type: "sawtooth" },
  ],
};

/** Play an effect if sound is enabled. Routed through the master volume gain. */
export function playSfx(name: Sfx): void {
  if (!isSoundOn()) return;
  const c = ac();
  if (!c || !master) return;
  // Schedule slightly ahead of the (possibly just-resumed) context clock.
  let t = c.currentTime + 0.02;
  for (const note of SFX_NOTES[name]) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = note.type;
    osc.frequency.value = note.freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.85, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + note.dur);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + note.dur + 0.02);
    t += note.dur;
  }
}
