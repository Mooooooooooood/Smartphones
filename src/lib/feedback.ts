"use client";

import { playSfx, prime } from "@/lib/sound";
import { vibrate } from "@/lib/haptics";

/**
 * One call per game moment — routes to sound + haptics, each gated by its own
 * setting. Call these from event handlers / reward effects so feedback stays
 * consistent across the app.
 */
export const fx = {
  tap() {
    prime();
    playSfx("tap");
    vibrate("tap");
  },
  correct() {
    playSfx("correct");
    vibrate("correct");
  },
  wrong() {
    playSfx("wrong");
    vibrate("wrong");
  },
  chest() {
    playSfx("chest");
    vibrate("chest");
  },
  win() {
    playSfx("win");
    vibrate("match");
  },
  lose() {
    playSfx("lose");
    vibrate("match");
  },
};
