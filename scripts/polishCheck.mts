/**
 * Sprint 15 polish checks — pure logic for the sound + haptics services.
 * Run: npx tsx scripts/polishCheck.mts
 */
import { SFX_NOTES, isSoundOn, getVolume, type Sfx } from "../src/lib/sound.ts";
import { HAPTIC_PATTERNS, isHapticsOn, hapticsSupported, type HapticEvent } from "../src/lib/haptics.ts";

let pass = 0;
let fail = 0;
function ok(name: string, cond: boolean) {
  if (cond) pass++;
  else {
    fail++;
    console.error("✗", name);
  }
}

// ---- Sound ----
const sfx: Sfx[] = ["tap", "correct", "wrong", "chest", "win", "lose"];
ok("SFX_NOTES has all six effects", sfx.every((s) => Array.isArray(SFX_NOTES[s]) && SFX_NOTES[s].length > 0));
ok(
  "every SFX note has a positive freq + dur and an oscillator type",
  sfx.every((s) => SFX_NOTES[s].every((n) => n.freq > 0 && n.dur > 0 && typeof n.type === "string")),
);
ok("sound is ON by default (no localStorage)", isSoundOn() === true);
ok("default volume is audible (0.4, not 0)", getVolume() === 0.4);

// ---- Haptics ----
const hev: HapticEvent[] = ["tap", "correct", "wrong", "chest", "match"];
ok("HAPTIC_PATTERNS has all five events", hev.every((e) => HAPTIC_PATTERNS[e] !== undefined));
ok(
  "haptic patterns are a number or an array of numbers",
  hev.every((e) => {
    const p = HAPTIC_PATTERNS[e];
    return typeof p === "number" || (Array.isArray(p) && p.every((n) => typeof n === "number"));
  }),
);
ok("haptics ON by default (no localStorage)", isHapticsOn() === true);
ok("haptics unsupported in node (no navigator.vibrate)", hapticsSupported() === false);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log("✓ All polish checks passed");
