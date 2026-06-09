import type { Quiz } from "./tier0";

export interface BossChallenge {
  id: string; // e.g. "tier-0"
  tier: number;
  title: string;
  subtitle: string;
  /** Number of correct answers required to pass. */
  passScore: number;
  xpReward: number;
  questions: Quiz[];
  /** Concept label per question, shown on the review screen after a fail. */
  concepts: string[];
}

/** Tier 0 Trial — five mixed questions drawn from the Foundations lessons. */
export const TIER0_BOSS: BossChallenge = {
  id: "tier-0",
  tier: 0,
  title: "Tier 0 Trial",
  subtitle: "Prove your Foundations",
  passScore: 4,
  xpReward: 150,
  concepts: ["Coordinates", "How Pieces Move", "Check", "Castling", "Stalemate"],
  questions: [
    {
      question: "Which square is always light?",
      choices: ["a1", "h1", "a8", "d4"],
      correctIndex: 1,
    },
    {
      question: "Which piece can jump over other pieces?",
      choices: ["Bishop", "Rook", "Knight", "Queen"],
      correctIndex: 2,
    },
    {
      question: "When your king is in check, what must you do?",
      choices: [
        "Castle immediately",
        "Get out of check this move",
        "Offer a draw",
        "Promote a pawn",
      ],
      correctIndex: 1,
    },
    {
      question: "Castling is illegal when…",
      choices: [
        "the king has already moved",
        "it is the first move of the game",
        "you are White",
        "the rook is on its starting square",
      ],
      correctIndex: 0,
    },
    {
      question: "A stalemate happens when the side to move…",
      choices: [
        "is in checkmate",
        "has no legal move but is NOT in check",
        "runs out of time",
        "has only a king left",
      ],
      correctIndex: 1,
    },
  ],
};

export const BOSSES: BossChallenge[] = [TIER0_BOSS];

export function bossById(id: string): BossChallenge | undefined {
  return BOSSES.find((b) => b.id === id);
}
