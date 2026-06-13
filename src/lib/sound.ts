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
const DEFAULT_VOLUME = 0.4;
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }
function subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb); }

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

function ac(): Ctx | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = getVolume();
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Warm the context after a user gesture so later sounds are instant. */
export function prime(): void {
  ac();
}

/** Register a one-time global gesture listener that unlocks audio (iOS). */
export function primeOnFirstGesture(): void {
  if (typeof window === "undefined") return;
  const unlock = () => { prime(); };
  window.addEventListener("pointerdown", unlock, { once: true, passive: true });
  window.addEventListener("touchstart", unlock, { once: true, passive: true });
  window.addEventListener("keydown", unlock, { once: true });
}

export type Sfx = "tap" | "correct" | "wrong" | "chest" | "win" | "lose";

/** Pure note spec per effect — exported for testing. */
export const SFX_NOTES: Record<Sfx, { freq: number; dur: number; type: OscillatorType }[]> = {
  tap: [{ freq: 440, dur: 0.05, type: "square" }],
  correct: [
    { freq: 660, dur: 0.08, type: "square" },
    { freq: 880, dur: 0.1, type: "square" },
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
    gain.gain.exponentialRampToValueAtTime(0.6, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + note.dur);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + note.dur + 0.02);
    t += note.dur;
  }
}
