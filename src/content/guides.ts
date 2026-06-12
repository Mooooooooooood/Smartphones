import type { BuddyPiece } from "@/components/characters/ChessBuddy";

/**
 * The Rang guide cast — each guide has a colour identity, a home section, and a
 * role, so characters never appear at random. Gold is the player; red is the
 * elite rival. This registry is the single source of truth for "who owns what".
 */
export type GuideId = "player" | "scholar" | "tactician" | "sentinel" | "oracle" | "rival";
export type GuideColor = "gold" | "blue" | "green" | "orange" | "purple" | "red";
export type Section = "profile" | "academy" | "puzzles" | "play" | "academy-gate";

export interface Guide {
  id: GuideId;
  name: string;
  piece: BuddyPiece;
  color: GuideColor;
  /** Which section this guide belongs to / hosts. */
  home: Section;
  role: string;
}

export const GUIDES: Record<GuideId, Guide> = {
  // Gold = the player's own identity.
  player: { id: "player", name: "You", piece: "king", color: "gold", home: "profile", role: "Your hero" },
  // Blue = Academy / foundational learning.
  scholar: { id: "scholar", name: "Pip", piece: "pawn", color: "blue", home: "academy", role: "Academy guide" },
  // Green = Puzzles / tactics.
  tactician: { id: "tactician", name: "Gallop", piece: "knight", color: "green", home: "puzzles", role: "Tactics coach" },
  // Orange = steady practical play coach.
  sentinel: { id: "sentinel", name: "Bramble", piece: "rook", color: "orange", home: "play", role: "Play coach" },
  // Purple = advanced gate / tier trials.
  oracle: { id: "oracle", name: "Vera", piece: "queen", color: "purple", home: "academy-gate", role: "Trial host" },
  // Red = elite rival / extreme challenger.
  rival: { id: "rival", name: "Vex", piece: "queen", color: "red", home: "play", role: "Elite rival" },
};

/** The guide that owns a given section (the one allowed to appear there). */
export function guideForSection(section: Section): Guide {
  return Object.values(GUIDES).find((g) => g.home === section) ?? GUIDES.player;
}
