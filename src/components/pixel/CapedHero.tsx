"use client";

import { PixelArt } from "@/components/pixel/pixelArt";
import { PLAYER_PALETTES } from "@/components/pixel/PixelSprite";
import { usePlayerColor } from "@/lib/playerColor";

/**
 * The player's caped hero — a round mascot with a flowing crimson cape, on the
 * home screen's character vignette. Body is tinted by the colour chosen in
 * Settings; the cape stays a heroic crimson.
 */
const GRID = [
  "      OOOO      ",
  "     OBBBBO     ",
  "    OBHHHHBO    ",
  "    OBEBBEBO    ",
  "    OBBBBBBO    ",
  "    OkBmmBkO    ",
  "     OBBBBO     ",
  "    CCOOOOCC    ",
  "   CCCBBBBCCC   ",
  "  CCCCBBBBCCCC  ",
  " CcCCCBHHBCCCcC ",
  " CcCCCBBBBCCCcC ",
  "CcCCCBBBBBBCCCcC",
  "CcCCBBBBBBBBCCcC",
  " CCBBBBBBBBBBCC ",
  "  OBBBBBBBBBBO  ",
  "  OOOOOOOOOOOO  ",
];

export default function CapedHero({ size = 48, className = "" }: { size?: number; className?: string }) {
  const color = usePlayerColor();
  const p = PLAYER_PALETTES[color];
  const colors: Record<string, string> = {
    O: p.line,
    B: p.body,
    H: p.hi,
    E: "#101730",
    m: p.line,
    k: "#ff9bb0",
    C: "#bb2238",
    c: "#6e0014",
  };
  return <PixelArt grid={GRID} colors={colors} w={16} size={size} className={`${className} tab-bob`} />;
}
