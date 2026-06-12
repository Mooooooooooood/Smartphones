"use client";

import ChessBuddy from "@/components/characters/ChessBuddy";
import { PLAYER_PALETTES } from "@/components/pixel/PixelSprite";
import { usePlayerColor } from "@/lib/playerColor";

/**
 * The player's own hero avatar — a crowned king sprite tinted with the colour
 * chosen in Settings (gold by default). This is "you" everywhere in the app.
 */
export default function PlayerAvatar({ size = 56, className = "" }: { size?: number; className?: string }) {
  const color = usePlayerColor();
  return <ChessBuddy piece="king" size={size} className={className} palette={PLAYER_PALETTES[color]} />;
}
