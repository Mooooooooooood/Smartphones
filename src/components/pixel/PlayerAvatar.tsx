"use client";

import ChessBuddy from "@/components/characters/ChessBuddy";
import { PLAYER_PALETTES } from "@/components/pixel/PixelSprite";
import { usePlayerColor } from "@/lib/playerColor";
import { usePlayerPiece } from "@/lib/playerIdentity";

/**
 * The player's own avatar — the chess piece chosen in the collection (a pawn to
 * start, fancier pieces once unlocked), tinted with the colour chosen in
 * Settings. This is "you" everywhere in the app.
 */
export default function PlayerAvatar({ size = 56, className = "" }: { size?: number; className?: string }) {
  const color = usePlayerColor();
  const piece = usePlayerPiece();
  return <ChessBuddy piece={piece} size={size} className={className} palette={PLAYER_PALETTES[color]} />;
}
