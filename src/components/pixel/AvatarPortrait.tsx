"use client";

import { PixelArt } from "@/components/pixel/pixelArt";
import { PLAYER_PALETTES } from "@/components/pixel/PixelSprite";
import { usePlayerColor } from "@/lib/playerColor";

/**
 * The player's portrait bust — a crowned hero face (hair, skin, eyes, armoured
 * shoulders). The crown + armour studs take the colour chosen in Settings.
 * Used in the Profile player card frame.
 */
const GRID = [
  "    K k K k K   ",
  "    KKKKKKKK    ",
  "   OAAAAAAAAO   ",
  "   OASSSSSSAO   ",
  "   OASSSSSSAO   ",
  "   OSEsSSsEsO   ",
  "   OSsSSSSsSO   ",
  "   OSssMMssSO   ",
  "    OSSMMSSO    ",
  "    OsSSSSsO    ",
  "   ORRRRRRRRO   ",
  "  ORRkRRRRkRRO  ",
  "  ORRRRRRRRRRO  ",
  "  ORRRRRRRRRRO  ",
  "   OOOOOOOOOO   ",
];

export default function AvatarPortrait({ size = 54, className = "" }: { size?: number; className?: string }) {
  const color = usePlayerColor();
  const p = PLAYER_PALETTES[color];
  const colors: Record<string, string> = {
    K: p.body,
    k: "#5fe0ff",
    A: "#2a2236",
    S: "#e8b888",
    s: "#c8905f",
    E: "#101730",
    M: "#9a5446",
    O: "#16101f",
    R: "#2f64c4",
  };
  return <PixelArt grid={GRID} colors={colors} w={16} size={size} className={className} shadow={false} />;
}
