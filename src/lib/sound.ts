"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny generated sound-effects service. No external assets — every sound is a
 * short Web Audio envelope. Sound is OFF by default; the AudioContext is only
 * created after the first user gesture (iOS autoplay-safe).
 */
const KEY = "rang-sound";
const listeners = new Set<() => void>();

export function isSoundOn(): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(KEY) === "on";
}

export function setSoundOn(on: boolean): void {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* storage unavailable */
  }
  if (on) prime();
  listeners.forEach((l) => l());
}

export function useSoundOn(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    isSoundOn,
    () => false,
  );
}

/* ---- Web Audio ---- */
type Ctx = AudioContext;
let ctx: Ctx | null = null;

function ac(): Ctx | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Warm the context after a user gesture so later sounds are instant. */
export function prime(): void {
  ac();
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

/** Play an effect if sound is enabled. Safe to call anywhere. */
export function playSfx(name: Sfx): void {
  if (!isSoundOn()) return;
  const c = ac();
  if (!c) return;
  let t = c.currentTime;
  for (const note of SFX_NOTES[name]) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = note.type;
    osc.frequency.value = note.freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + note.dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + note.dur + 0.02);
    t += note.dur;
  }
}
