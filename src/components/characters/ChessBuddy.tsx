/**
 * The Rang guide characters. The cast metadata lives here; the visual is a
 * pixel-art sprite (see PixelSprite) so every `<ChessBuddy>` across the app
 * renders as a retro mascot automatically.
 */
import { memo } from "react";
import PixelSprite, { type BuddyPiece, type SpritePalette } from "@/components/pixel/PixelSprite";

export type { BuddyPiece };

export interface BuddyMeta {
  piece: BuddyPiece;
  name: string;
  role: string;
}

export const BUDDIES: Record<BuddyPiece, BuddyMeta> = {
  pawn: { piece: "pawn", name: "Pip", role: "Beginner guide" },
  knight: { piece: "knight", name: "Gallop", role: "Tactics coach" },
  rook: { piece: "rook", name: "Bramble", role: "Sparring partner" },
  bishop: { piece: "bishop", name: "Bea", role: "Lesson mentor" },
  queen: { piece: "queen", name: "Vera", role: "Challenge host" },
  king: { piece: "king", name: "Cassius", role: "Academy master" },
};

function ChessBuddy({
  piece,
  size = 64,
  className = "",
  palette,
}: {
  piece: BuddyPiece;
  size?: number;
  className?: string;
  palette?: SpritePalette;
}) {
  return <PixelSprite piece={piece} size={size} className={className} palette={palette} />;
}

export default memo(ChessBuddy);
