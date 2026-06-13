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

/** Tier 1 Trial — five tactical questions, one per core pattern. Pass 4/5. */
export const TIER1_BOSS: BossChallenge = {
  id: "tier-1",
  tier: 1,
  title: "Tier 1 Trial",
  subtitle: "Prove your Tactics",
  passScore: 4,
  xpReward: 200,
  concepts: ["Hanging Piece", "Fork", "Pin", "Skewer / Discovered", "Mate in One"],
  questions: [
    {
      question: "An enemy bishop sits on a square no piece defends. What is it?",
      choices: ["Pinned", "Hanging — take it for free", "Skewered", "Protected"],
      correctIndex: 1,
    },
    {
      question: "A knight attacks the king and queen at once. This tactic is a…",
      choices: ["Pin", "Skewer", "Fork", "Zwischenzug"],
      correctIndex: 2,
    },
    {
      question: "A knight can't move because its king would be exposed. It is…",
      choices: ["Forked", "Absolutely pinned", "Hanging", "Skewered"],
      correctIndex: 1,
    },
    {
      question: "You check the king along a file; it steps aside and you grab the rook behind it. That's a…",
      choices: ["Fork", "Skewer", "Hanging piece", "Stalemate"],
      correctIndex: 1,
    },
    {
      question: "Checkmate in one means…",
      choices: [
        "a check the king cannot escape, block, or capture",
        "winning the queen",
        "any check",
        "promoting a pawn",
      ],
      correctIndex: 0,
    },
  ],
};

export const BOSSES: BossChallenge[] = [TIER0_BOSS, TIER1_BOSS];

export function bossById(id: string): BossChallenge | undefined {
  return BOSSES.find((b) => b.id === id);
}
