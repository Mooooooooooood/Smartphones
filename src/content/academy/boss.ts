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
        "Promote a pawn",
        "Offer a draw",
        "Get out of check this move",
      ],
      correctIndex: 3,
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
      choices: ["Pinned", "Skewered", "Hanging — take it for free", "Protected"],
      correctIndex: 2,
    },
    {
      question: "A knight attacks the king and queen at once. This tactic is a…",
      choices: ["Pin", "Skewer", "Zwischenzug", "Fork"],
      correctIndex: 3,
    },
    {
      question: "A knight can't move because its king would be exposed. It is…",
      choices: ["Absolutely pinned", "Forked", "Hanging", "Skewered"],
      correctIndex: 0,
    },
    {
      question: "You check the king along a file; it steps aside and you grab the rook behind it. That's a…",
      choices: ["Fork", "Skewer", "Hanging piece", "Stalemate"],
      correctIndex: 1,
    },
    {
      question: "Checkmate in one means…",
      choices: [
        "any check",
        "winning the queen",
        "a check the king cannot escape, block, or capture",
        "promoting a pawn",
      ],
      correctIndex: 2,
    },
  ],
};

/** Tier 2 Trial — five positional questions. Pass 4/5. */
export const TIER2_BOSS: BossChallenge = {
  id: "tier-2",
  tier: 2,
  title: "Tier 2 Trial",
  subtitle: "Prove your Strategy",
  passScore: 4,
  xpReward: 250,
  concepts: ["The Centre", "Development", "King Safety", "Open Files", "Pawn Weaknesses"],
  questions: [
    {
      question: "Why is controlling the centre so important?",
      choices: [
        "Edges are dangerous",
        "It is required by the rules",
        "It immediately wins material",
        "Central pieces and pawns control more of the board",
      ],
      correctIndex: 3,
    },
    {
      question: "In the opening you should…",
      choices: [
        "Develop a new knight or bishop toward the centre each move",
        "Move only pawns",
        "Bring the queen out at once",
        "March the king up",
      ],
      correctIndex: 0,
    },
    {
      question: "Castling early is good because it…",
      choices: ["wins a pawn", "gets the king safe and connects the rooks", "promotes a pawn", "is forced"],
      correctIndex: 1,
    },
    {
      question: "A rook is strongest on…",
      choices: ["a file blocked by its own pawns", "the first rank forever", "an open file", "the a-file only"],
      correctIndex: 2,
    },
    {
      question: "An isolated pawn is one that…",
      choices: [
        "is defended by a rook",
        "is about to promote",
        "sits on the edge",
        "has no friendly pawn on either neighbouring file",
      ],
      correctIndex: 3,
    },
  ],
};

/** Tier 3 Trial — five endgame questions. Pass 4/5. */
export const TIER3_BOSS: BossChallenge = {
  id: "tier-3",
  tier: 3,
  title: "Tier 3 Trial",
  subtitle: "Prove your Endgames",
  passScore: 4,
  xpReward: 300,
  concepts: ["King Activity", "Opposition", "Rule of the Square", "King & Pawn", "Basic Mates"],
  questions: [
    {
      question: "In an endgame, your king should be…",
      choices: ["centralised and active", "hidden in the corner", "traded off", "left on the back rank"],
      correctIndex: 0,
    },
    {
      question: "You hold the opposition when…",
      choices: [
        "your king is in check",
        "the kings are one square apart and it's your opponent to move",
        "you have more pawns",
        "your king is on the edge",
      ],
      correctIndex: 1,
    },
    {
      question: "The rule of the square tells you whether…",
      choices: ["a pawn is isolated", "you may castle", "a king can catch a passed pawn", "a bishop is bad"],
      correctIndex: 2,
    },
    {
      question: "When escorting a passed pawn, your king belongs…",
      choices: ["behind the pawn", "anywhere", "in the corner", "in front of the pawn, leading it"],
      correctIndex: 3,
    },
    {
      question: "To checkmate with king and queen, you must…",
      choices: [
        "bring your king up to support the queen",
        "use the queen alone",
        "give checks forever",
        "promote a second pawn",
      ],
      correctIndex: 0,
    },
  ],
};

export const BOSSES: BossChallenge[] = [TIER0_BOSS, TIER1_BOSS, TIER2_BOSS, TIER3_BOSS];

export function bossById(id: string): BossChallenge | undefined {
  return BOSSES.find((b) => b.id === id);
}
