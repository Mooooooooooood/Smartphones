import type { BuddyPiece } from "@/components/characters/ChessBuddy";

/**
 * Opening repertoires for the Opening Trainer. Each opening is a short main line
 * in SAN (canonical, so the trainer derives moves via chess.js — no hand-written
 * UCI to get wrong). The learner plays one colour; the other side's book replies
 * auto-play. Lines are standard, sound theory; a test re-verifies every move is
 * legal and that the learner's moves are not engine blunders.
 */
export interface OpeningMove {
  san: string;
  /** Shown when this move is reached (teaching note for the learner's moves). */
  note?: string;
}

export interface Opening {
  id: string;
  name: string;
  /** The colour the learner plays. */
  side: "white" | "black";
  eco: string;
  summary: string;
  /** The big idea, shown on the intro. */
  idea: string;
  guide: BuddyPiece;
  /** Full main line from the start, alternating colours. */
  line: OpeningMove[];
}

export const OPENINGS: Opening[] = [
  {
    id: "italian",
    name: "Italian Game",
    side: "white",
    eco: "C50",
    summary: "Classic 1.e4 opening — quick development and an eye on f7.",
    idea: "Develop the bishop to c4 aiming at f7, support the centre with c3/d3, then castle. Fast, principled, and great for beginners.",
    guide: "knight",
    line: [
      { san: "e4", note: "Claim the centre and open lines for the bishop and queen." },
      { san: "e5" },
      { san: "Nf3", note: "Develop with a threat — the knight attacks e5." },
      { san: "Nc6" },
      { san: "Bc4", note: "The Italian bishop, aimed straight at the weak f7 square." },
      { san: "Bc5" },
      { san: "c3", note: "Prepare d4, building a big pawn centre." },
      { san: "Nf6" },
      { san: "d3", note: "Solidly support e4 and open the dark-squared bishop." },
      { san: "d6" },
      { san: "O-O", note: "King safety first — castle, then play in the centre." },
      { san: "O-O" },
    ],
  },
  {
    id: "london",
    name: "London System",
    side: "white",
    eco: "D02",
    summary: "A solid, easy-to-learn 1.d4 system you can play on autopilot.",
    idea: "Build the same sturdy setup every game: Bf4, e3, Nf3, Bd3, c3. Reliable structure, few traps to memorise.",
    guide: "bishop",
    line: [
      { san: "d4", note: "Stake out the centre with the queen's pawn." },
      { san: "d5" },
      { san: "Bf4", note: "Develop the bishop OUTSIDE the pawn chain — the heart of the London." },
      { san: "Nf6" },
      { san: "e3", note: "Open the other bishop and make a solid pawn triangle." },
      { san: "e6" },
      { san: "Nf3", note: "Develop the knight toward the centre." },
      { san: "Bd6" },
      { san: "Bg3", note: "Keep the strong bishop by sidestepping the trade." },
      { san: "O-O" },
      { san: "Bd3", note: "Aim the light bishop at Black's kingside." },
      { san: "Nc6" },
    ],
  },
  {
    id: "scandinavian",
    name: "Scandinavian Defense",
    side: "black",
    eco: "B01",
    summary: "A direct answer to 1.e4 — challenge the centre at once.",
    idea: "Strike with 1...d5 immediately. After trades the queen comes out, then retreats safely while you develop quickly.",
    guide: "queen",
    line: [
      { san: "e4" },
      { san: "d5", note: "Hit the e4 pawn right away and fight for the centre." },
      { san: "exd5" },
      { san: "Qxd5", note: "Recapture with the queen — active, but watch for Nc3." },
      { san: "Nc3" },
      { san: "Qa5", note: "Retreat the queen to a safe, active square out of the knight's reach." },
      { san: "d4" },
      { san: "Nf6", note: "Develop and prepare to contest the centre." },
      { san: "Nf3" },
      { san: "c6", note: "Give the queen a retreat square and prepare ...Bf5." },
      { san: "Bc4" },
      { san: "Bf5", note: "Develop the bishop actively before locking it in with ...e6." },
    ],
  },
];

export function openingById(id: string): Opening | undefined {
  return OPENINGS.find((o) => o.id === id);
}

/** Whose move it is at `ply` (0-based): White on even plies, Black on odd. */
export function moverAt(ply: number): "white" | "black" {
  return ply % 2 === 0 ? "white" : "black";
}

/** Is it the learner's turn to move at `ply`? */
export function isLearnerTurn(opening: Opening, ply: number): boolean {
  return moverAt(ply) === opening.side;
}
