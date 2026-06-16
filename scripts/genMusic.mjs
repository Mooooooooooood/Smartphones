/**
 * Generates an ORIGINAL, royalty-free chiptune ambient loop → public/audio/ambient.wav
 * (and .ogg/.mp3 too if ffmpeg is on PATH). No external assets, no dependencies.
 *
 * A cozy 8-bar Am–F–C–G progression: soft triangle pad + square bass pulses +
 * a gentle square arpeggio lead. Every voice gates to silence on its note/bar
 * boundary and the buffer is a whole number of bars, so the file loops seamlessly
 * when played with <audio loop>.
 *
 * Run: node scripts/genMusic.mjs
 */
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const SR = 22050;          // sample rate (small file, fine for chiptune)
const BPM = 96;
const beat = 60 / BPM;     // seconds per beat
const beatsPerBar = 4;
const bars = 8;
const N = Math.round(SR * bars * beatsPerBar * beat);
const buf = new Float32Array(N);

// Note frequencies (equal temperament).
const F = {
  A2: 110.0, C3: 130.81, E3: 164.81, F2: 87.31, G2: 98.0, B2: 123.47, D3: 146.83,
  A3: 220.0, C4: 261.63, E4: 329.63, F3: 174.61, G4: 392.0, G3: 196.0, B3: 246.94, D4: 293.66,
};

// One chord per bar (vi–IV–I–V in A minor, twice): [bassRoot, triad...].
const PROG = [
  { bass: "A2", triad: ["A3", "C4", "E4"] },
  { bass: "F2", triad: ["F3", "A3", "C4"] },
  { bass: "C3", triad: ["C4", "E4", "G4"] },
  { bass: "G2", triad: ["G3", "B3", "D4"] },
];
const chordForBar = (b) => PROG[b % PROG.length];

const square = (ph) => (ph % 1 < 0.5 ? 1 : -1);
const tri = (ph) => 4 * Math.abs((ph % 1) - 0.5) - 1;

/** Add one note (with a click-free attack + release-to-zero) into the buffer. */
function note(startSec, durSec, freq, wave, vol) {
  const start = Math.floor(startSec * SR);
  const len = Math.floor(durSec * SR);
  const atk = 0.008;
  const relFrom = durSec * 0.75; // release the last quarter to 0 → seamless boundaries
  for (let i = 0; i < len && start + i < N; i++) {
    const t = i / SR;
    const ph = freq * t;
    const s = wave === "tri" ? tri(ph) : square(ph);
    const a = Math.min(1, t / atk);
    const r = t > relFrom ? Math.max(0, 1 - (t - relFrom) / (durSec - relFrom)) : 1;
    buf[start + i] += s * vol * a * r;
  }
}

for (let bar = 0; bar < bars; bar++) {
  const { bass, triad } = chordForBar(bar);
  const barStart = bar * beatsPerBar * beat;
  // Pad: sustained triad across the bar (soft triangle).
  for (const n of triad) note(barStart, beatsPerBar * beat, F[n], "tri", 0.05);
  for (let b = 0; b < beatsPerBar; b++) {
    const t0 = barStart + b * beat;
    // Bass: two square eighth-pulses per beat on the root.
    note(t0, beat * 0.45, F[bass], "square", 0.11);
    note(t0 + beat * 0.5, beat * 0.45, F[bass], "square", 0.09);
    // Lead: arpeggiate the triad an octave up, one note per beat.
    const lead = F[triad[b % triad.length]] * 2;
    note(t0, beat * 0.9, lead, "square", 0.07);
  }
}

// Normalise to int16 with a little headroom.
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(buf[i]));
const gain = peak > 0 ? 0.85 / peak : 1;

const data = Buffer.alloc(N * 2);
for (let i = 0; i < N; i++) {
  const v = Math.max(-1, Math.min(1, buf[i] * gain));
  data.writeInt16LE(Math.round(v * 32767), i * 2);
}

// WAV (PCM 16-bit mono) header.
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + data.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);        // PCM
header.writeUInt16LE(1, 22);        // mono
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 2, 28);   // byte rate
header.writeUInt16LE(2, 32);        // block align
header.writeUInt16LE(16, 34);       // bits/sample
header.write("data", 36);
header.writeUInt32LE(data.length, 40);

mkdirSync("public/audio", { recursive: true });
writeFileSync("public/audio/ambient.wav", Buffer.concat([header, data]));
console.log(`✓ public/audio/ambient.wav (${(data.length / 1024 / 1024).toFixed(2)} MB, ${(N / SR).toFixed(1)}s loop)`);

// Optional smaller formats if ffmpeg is available.
const hasFfmpeg = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status === 0;
if (hasFfmpeg) {
  for (const [fmt, args] of [
    ["ogg", ["-c:a", "libvorbis", "-q:a", "3"]],
    ["mp3", ["-c:a", "libmp3lame", "-q:a", "5"]],
  ]) {
    const out = `public/audio/ambient.${fmt}`;
    const r = spawnSync("ffmpeg", ["-y", "-i", "public/audio/ambient.wav", ...args, out], { stdio: "ignore" });
    if (r.status === 0 && existsSync(out)) console.log(`✓ ${out}`);
  }
} else {
  console.log("• ffmpeg not found — shipping .wav only");
}
