/**
 * Original beginner tactics puzzles for Sprint 3.
 *
 * Every position here was composed from scratch for Tabiya — no positions are
 * taken from Chess.com, Lichess studies, books, or any other proprietary
 * source. They are deliberately sparse so the single tactical point is clear.
 *
 * The `correctUci` field is the canonical answer (long algebraic, e.g.
 * "a1a8"); `answerSan` is a human-friendly mirror used in explanations.
 */

export type PuzzleTheme =
  | "mate-in-1"
  | "hanging-piece"
  | "fork"
  | "pin"
  | "skewer"
  | "back-rank"
  | "undefended-capture"
  | "checkmate-pattern"
  | "remove-defender"
  | "discovered-attack";

export type PuzzleCategory = "tactics" | "calculation" | "mate";

export interface Puzzle {
  id: string;
  title: string;
  theme: PuzzleTheme;
  /** Difficulty, roughly 400–800 for this beginner set. */
  rating: number;
  fen: string;
  sideToMove: "w" | "b";
  /** Canonical answer in UCI / long algebraic, e.g. "e2e4". */
  correctUci: string;
  /** Optional readable mirror of the answer, e.g. "Ra8#". */
  answerSan?: string;
  explanation: string;
  xpReward: number;
  categories: PuzzleCategory[];
  hint?: string;
}

export const THEME_LABELS: Record<PuzzleTheme, string> = {
  "mate-in-1": "Mate in 1",
  "hanging-piece": "Hanging Piece",
  fork: "Fork",
  pin: "Pin",
  skewer: "Skewer",
  "back-rank": "Back Rank",
  "undefended-capture": "Undefended Capture",
  "checkmate-pattern": "Checkmate Pattern",
  "remove-defender": "Remove the Defender",
  "discovered-attack": "Discovered Attack",
};

export const PUZZLE_THEMES: PuzzleTheme[] = [
  "mate-in-1",
  "hanging-piece",
  "fork",
  "pin",
  "skewer",
  "back-rank",
  "undefended-capture",
  "checkmate-pattern",
  "remove-defender",
  "discovered-attack",
];

export const BEGINNER_PUZZLES: Puzzle[] = [
  // ---------- Mate in 1 ----------
  {
    id: "b01-mate1-rook-backrank",
    title: "Deliver mate",
    theme: "mate-in-1",
    rating: 400,
    fen: "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1",
    sideToMove: "w",
    correctUci: "a1a8",
    answerSan: "Ra8#",
    explanation:
      "Ra8# is checkmate. The Black king is boxed in by its own f7, g7 and h7 pawns, so the rook's check along the eighth rank ends the game.",
    xpReward: 20,
    categories: ["tactics", "mate"],
    hint: "Look along the open file toward the trapped king.",
  },
  {
    id: "b02-mate1-queen-support",
    title: "Finish with the queen",
    theme: "mate-in-1",
    rating: 430,
    fen: "6k1/8/5K2/8/8/8/8/6Q1 w - - 0 1",
    sideToMove: "w",
    correctUci: "g1g7",
    answerSan: "Qg7#",
    explanation:
      "Qg7# is mate. The queen guards every escape square (f8, h8, f7, h7) and is protected by the White king on f6, so it cannot be captured.",
    xpReward: 25,
    categories: ["tactics", "mate"],
    hint: "Bring the queen right next to the king — your king defends it.",
  },
  {
    id: "b03-mate1-rook-corner",
    title: "Corner the king",
    theme: "mate-in-1",
    rating: 450,
    fen: "1k6/ppp5/8/8/8/8/8/4R1K1 w - - 0 1",
    sideToMove: "w",
    correctUci: "e1e8",
    answerSan: "Re8#",
    explanation:
      "Re8# is checkmate. The a7, b7 and c7 pawns seal the king's only flight squares, so the rook's check on the back rank is final.",
    xpReward: 25,
    categories: ["tactics", "mate"],
    hint: "The queenside king is just as trapped as a kingside one.",
  },

  // ---------- Hanging piece ----------
  {
    id: "b04-hanging-knight-takes-bishop",
    title: "Win the loose bishop",
    theme: "hanging-piece",
    rating: 420,
    fen: "4k3/8/8/3b4/8/4N3/8/4K3 w - - 0 1",
    sideToMove: "w",
    correctUci: "e3d5",
    answerSan: "Nxd5",
    explanation:
      "Nxd5 simply wins the bishop. It is undefended — a hanging piece — so the knight grabs it for free.",
    xpReward: 20,
    categories: ["tactics"],
    hint: "A knight on e3 reaches a certain undefended square.",
  },
  {
    id: "b05-hanging-rook-takes-bishop",
    title: "Take what's free",
    theme: "hanging-piece",
    rating: 440,
    fen: "4k3/8/8/8/2b5/8/8/2R1K3 w - - 0 1",
    sideToMove: "w",
    correctUci: "c1c4",
    answerSan: "Rxc4",
    explanation:
      "Rxc4 wins the bishop outright. Nothing defends it, so the rook collects a free piece.",
    xpReward: 20,
    categories: ["tactics"],
    hint: "The rook and the bishop share a file.",
  },
  {
    id: "b06-hanging-pawn-takes-queen",
    title: "Punish the queen",
    theme: "hanging-piece",
    rating: 470,
    fen: "4k3/8/8/3q4/4P3/8/8/4K3 w - - 0 1",
    sideToMove: "w",
    correctUci: "e4d5",
    answerSan: "exd5",
    explanation:
      "exd5 wins the queen with a humble pawn. The queen wandered next to a pawn that defends nothing of value in return.",
    xpReward: 25,
    categories: ["tactics"],
    hint: "Even a pawn can take a queen.",
  },

  // ---------- Fork ----------
  {
    id: "b07-fork-knight-king-rook",
    title: "Knight forks king and rook",
    theme: "fork",
    rating: 520,
    fen: "r3k3/8/8/1N6/8/8/8/4K3 w - - 0 1",
    sideToMove: "w",
    correctUci: "b5c7",
    answerSan: "Nc7+",
    explanation:
      "Nc7+ is a fork: the knight checks the king on e8 and simultaneously attacks the rook on a8. After the king moves, Nxa8 wins the rook.",
    xpReward: 30,
    categories: ["tactics", "calculation"],
    hint: "One knight jump hits the king and the rook at once.",
  },
  {
    id: "b08-fork-pawn-two-knights",
    title: "Pawn forks two knights",
    theme: "fork",
    rating: 540,
    fen: "4k3/8/3n1n2/8/4P3/8/8/4K3 w - - 0 1",
    sideToMove: "w",
    correctUci: "e4e5",
    answerSan: "e5",
    explanation:
      "e5 attacks both knights on d6 and f6 at the same time. They can't both escape, so one of them falls.",
    xpReward: 30,
    categories: ["tactics", "calculation"],
    hint: "Push the pawn between the two knights.",
  },
  {
    id: "b09-fork-knight-king-queen",
    title: "Royal fork",
    theme: "fork",
    rating: 600,
    fen: "4k3/8/8/3q4/6N1/8/8/4K3 w - - 0 1",
    sideToMove: "w",
    correctUci: "g4f6",
    answerSan: "Nf6+",
    explanation:
      "Nf6+ forks the king on e8 and the queen on d5. The king must respond to the check, then Nxd5 wins the queen.",
    xpReward: 35,
    categories: ["tactics", "calculation"],
    hint: "Find the knight check that also eyes the queen.",
  },

  // ---------- Pin ----------
  {
    id: "b10-pin-win-knight",
    title: "Win the pinned knight",
    theme: "pin",
    rating: 540,
    fen: "4k3/4n3/3P4/8/8/8/8/4R1K1 w - - 0 1",
    sideToMove: "w",
    correctUci: "d6e7",
    answerSan: "dxe7",
    explanation:
      "The knight on e7 is pinned to the king by the rook on e1, so it cannot run. dxe7 wins it.",
    xpReward: 30,
    categories: ["tactics"],
    hint: "The pinned knight can't move — attack it.",
  },
  {
    id: "b11-pin-pawn-takes-knight",
    title: "Exploit the pin",
    theme: "pin",
    rating: 560,
    fen: "4k3/8/8/4n3/3P4/8/4R3/4K3 w - - 0 1",
    sideToMove: "w",
    correctUci: "d4e5",
    answerSan: "dxe5",
    explanation:
      "The rook on e2 pins the e5-knight to the king on e8. dxe5 wins the helpless knight.",
    xpReward: 30,
    categories: ["tactics"],
    hint: "A pinned piece is a stationary target.",
  },
  {
    id: "b12-pin-pawn-takes-bishop",
    title: "The pin wins material",
    theme: "pin",
    rating: 600,
    fen: "3k4/8/3b4/4P3/8/8/8/3R1K2 w - - 0 1",
    sideToMove: "w",
    correctUci: "e5d6",
    answerSan: "exd6",
    explanation:
      "The bishop on d6 is pinned to the king by the rook on d1. exd6 collects the pinned bishop.",
    xpReward: 35,
    categories: ["tactics"],
    hint: "What is stuck in front of the king on the d-file?",
  },

  // ---------- Skewer ----------
  {
    id: "b13-skewer-rook-king-queen",
    title: "Skewer the king",
    theme: "skewer",
    rating: 560,
    fen: "4q3/4k3/8/8/8/8/8/R5K1 w - - 0 1",
    sideToMove: "w",
    correctUci: "a1e1",
    answerSan: "Re1+",
    explanation:
      "Re1+ skewers the king on e7 and the queen behind it on e8. When the king steps aside, Rxe8 wins the queen.",
    xpReward: 35,
    categories: ["tactics", "calculation"],
    hint: "Check the king along a file the queen is hiding on.",
  },
  {
    id: "b14-skewer-rook-king-queen-2",
    title: "Line them up",
    theme: "skewer",
    rating: 580,
    fen: "3q4/8/8/8/3k4/8/8/R5K1 w - - 0 1",
    sideToMove: "w",
    correctUci: "a1d1",
    answerSan: "Rd1+",
    explanation:
      "Rd1+ skewers the king on d4 to the queen on d8. The king must move off the file, and Rxd8 follows.",
    xpReward: 35,
    categories: ["tactics", "calculation"],
    hint: "King and queen already share a file — check it.",
  },
  {
    id: "b15-skewer-rook-rank",
    title: "Skewer on the rank",
    theme: "skewer",
    rating: 640,
    fen: "8/8/8/8/4k2r/8/8/R3K3 w - - 0 1",
    sideToMove: "w",
    correctUci: "a1a4",
    answerSan: "Ra4+",
    explanation:
      "Ra4+ checks the king along the fourth rank with the rook on h4 lined up behind it. The king moves, then Rxh4 wins the rook.",
    xpReward: 35,
    categories: ["tactics", "calculation"],
    hint: "A skewer can run along a rank, not just a file.",
  },

  // ---------- Back rank ----------
  {
    id: "b16-backrank-rook-d8",
    title: "Back-rank mate",
    theme: "back-rank",
    rating: 480,
    fen: "6k1/5ppp/8/8/8/8/8/3R2K1 w - - 0 1",
    sideToMove: "w",
    correctUci: "d1d8",
    answerSan: "Rd8#",
    explanation:
      "Rd8# is mate. The king has no luft — its own pawns block every escape — so the rook on the back rank finishes it.",
    xpReward: 25,
    categories: ["tactics", "mate"],
    hint: "The eighth rank is fatal when the king has no air.",
  },
  {
    id: "b17-backrank-queen-a8",
    title: "Queen on the back rank",
    theme: "back-rank",
    rating: 500,
    fen: "6k1/5ppp/8/8/8/8/8/Q5K1 w - - 0 1",
    sideToMove: "w",
    correctUci: "a1a8",
    answerSan: "Qa8#",
    explanation:
      "Qa8# delivers back-rank mate. The pawns on f7, g7 and h7 keep the king from escaping the eighth rank.",
    xpReward: 25,
    categories: ["tactics", "mate"],
    hint: "March the queen to the open back rank.",
  },
  {
    id: "b18-backrank-rook-f8",
    title: "Trapped on the eighth",
    theme: "back-rank",
    rating: 520,
    fen: "1k6/ppp5/8/8/8/8/8/5RK1 w - - 0 1",
    sideToMove: "w",
    correctUci: "f1f8",
    answerSan: "Rf8#",
    explanation:
      "Rf8# is checkmate. The queenside king is walled in by its a7, b7 and c7 pawns, and the rook covers the entire eighth rank.",
    xpReward: 25,
    categories: ["tactics", "mate"],
    hint: "Swing the rook to the back rank from a safe distance.",
  },

  // ---------- Undefended capture ----------
  {
    id: "b19-undefended-rook-takes-bishop",
    title: "Collect the bishop",
    theme: "undefended-capture",
    rating: 420,
    fen: "4k3/8/8/8/3b4/8/8/3RK3 w - - 0 1",
    sideToMove: "w",
    correctUci: "d1d4",
    answerSan: "Rxd4",
    explanation:
      "Rxd4 wins an undefended bishop. Always check whether an enemy piece is protected before you grab it — this one isn't.",
    xpReward: 20,
    categories: ["tactics"],
    hint: "The rook already shares a file with its target.",
  },
  {
    id: "b20-undefended-bishop-takes-rook",
    title: "Win the exchange",
    theme: "undefended-capture",
    rating: 460,
    fen: "4k3/8/8/8/r7/8/2B5/4K3 w - - 0 1",
    sideToMove: "w",
    correctUci: "c2a4",
    answerSan: "Bxa4+",
    explanation:
      "Bxa4+ captures an undefended rook with check. The bishop's diagonal runs straight to it.",
    xpReward: 20,
    categories: ["tactics"],
    hint: "Follow the bishop's diagonal to the corner of the board.",
  },
  {
    id: "b21-undefended-bishop-takes-knight",
    title: "Snap up the knight",
    theme: "undefended-capture",
    rating: 480,
    fen: "4k3/8/n7/8/8/8/8/4KB2 w - - 0 1",
    sideToMove: "w",
    correctUci: "f1a6",
    answerSan: "Bxa6",
    explanation:
      "Bxa6 wins the loose knight. The long diagonal from f1 is wide open all the way to a6.",
    xpReward: 20,
    categories: ["tactics"],
    hint: "The bishop sees a long way down an empty diagonal.",
  },

  // ---------- Checkmate pattern ----------
  {
    id: "b22-pattern-rook-mate",
    title: "Rook mate",
    theme: "checkmate-pattern",
    rating: 500,
    fen: "7k/8/6K1/8/8/8/8/R7 w - - 0 1",
    sideToMove: "w",
    correctUci: "a1a8",
    answerSan: "Ra8#",
    explanation:
      "Ra8# is the classic king-and-rook mate. The White king on g6 covers g7 and h7, the rook covers the eighth rank, and the Black king is trapped in the corner.",
    xpReward: 30,
    categories: ["tactics", "mate"],
    hint: "Your own king takes away the escape squares — the rook checkmates.",
  },
  {
    id: "b23-pattern-queen-mate-edge",
    title: "Queen mate on the edge",
    theme: "checkmate-pattern",
    rating: 520,
    fen: "k7/8/1K6/8/8/8/8/7Q w - - 0 1",
    sideToMove: "w",
    correctUci: "h1h8",
    answerSan: "Qh8#",
    explanation:
      "Qh8# mates. The queen checks along the eighth rank while the White king on b6 guards a7 and b7, leaving the Black king no square.",
    xpReward: 30,
    categories: ["tactics", "mate"],
    hint: "Deliver the queen check the king on b6 already supports.",
  },
  {
    id: "b24-pattern-queen-mate-corner",
    title: "Queen mate in the corner",
    theme: "checkmate-pattern",
    rating: 540,
    fen: "7k/8/6K1/8/8/8/8/Q7 w - - 0 1",
    sideToMove: "w",
    correctUci: "a1a8",
    answerSan: "Qa8#",
    explanation:
      "Qa8# is mate. With the White king covering g7 and h7, the queen's check on the eighth rank traps the king in the corner.",
    xpReward: 30,
    categories: ["tactics", "mate"],
    hint: "Slide the queen to the back rank; your king does the rest.",
  },

  // ---------- Remove the defender ----------
  {
    id: "b25-remove-defender-rxd8",
    title: "Remove the guard",
    theme: "remove-defender",
    rating: 640,
    fen: "3r2k1/5ppp/8/8/8/8/8/3R2K1 w - - 0 1",
    sideToMove: "w",
    correctUci: "d1d8",
    answerSan: "Rxd8#",
    explanation:
      "The Black rook on d8 is the only thing guarding the back rank. Rxd8# removes that defender and is checkmate at the same time.",
    xpReward: 35,
    categories: ["tactics", "calculation", "mate"],
    hint: "What single piece is holding the back rank together?",
  },
  {
    id: "b26-remove-defender-rxc8",
    title: "Eliminate the defender",
    theme: "remove-defender",
    rating: 680,
    fen: "2r3k1/5ppp/8/8/8/8/8/2R3K1 w - - 0 1",
    sideToMove: "w",
    correctUci: "c1c8",
    answerSan: "Rxc8#",
    explanation:
      "Rxc8# trades off the lone defender of the eighth rank and mates instantly, since the king is sealed in by its pawns.",
    xpReward: 35,
    categories: ["tactics", "calculation", "mate"],
    hint: "Capture the defender — it doubles as the mating move.",
  },
  {
    id: "b27-remove-defender-qxe8",
    title: "Crash through",
    theme: "remove-defender",
    rating: 720,
    fen: "4r1k1/5ppp/8/8/8/8/8/4Q1K1 w - - 0 1",
    sideToMove: "w",
    correctUci: "e1e8",
    answerSan: "Qxe8#",
    explanation:
      "Qxe8# removes the defending rook and delivers mate. The queen covers f8 while the king's own pawns block every other square.",
    xpReward: 40,
    categories: ["tactics", "calculation", "mate"],
    hint: "The queen can take the guard and give mate in one stroke.",
  },

  // ---------- Discovered attack ----------
  {
    id: "b28-discovered-knight-double-check",
    title: "Discovered double check",
    theme: "discovered-attack",
    rating: 720,
    fen: "2q1k3/8/8/8/4N3/8/8/4R1K1 w - - 0 1",
    sideToMove: "w",
    correctUci: "e4d6",
    answerSan: "Nd6+",
    explanation:
      "Nd6+ is a double check — the knight checks from d6 and uncovers the rook on e1. The king must move, and then Nxc8 wins the queen.",
    xpReward: 40,
    categories: ["tactics", "calculation"],
    hint: "Move the knight so the rook behind it also gives check.",
  },
  {
    id: "b29-discovered-bishop-check",
    title: "Uncover the bishop",
    theme: "discovered-attack",
    rating: 760,
    fen: "r5k1/8/4N3/8/8/8/B5K1/8 w - - 0 1",
    sideToMove: "w",
    correctUci: "e6c7",
    answerSan: "Nc7+",
    explanation:
      "Nc7+ steps out of the bishop's way with check (the bishop on a2 hits g8) while attacking the rook on a8. After the king moves, Nxa8 wins material.",
    xpReward: 40,
    categories: ["tactics", "calculation"],
    hint: "The knight blocks its own bishop — move it with tempo.",
  },
  {
    id: "b30-discovered-rook-wins-queen",
    title: "Discovery wins the queen",
    theme: "discovered-attack",
    rating: 800,
    fen: "3q4/6k1/8/8/3N4/8/8/3R1K2 w - - 0 1",
    sideToMove: "w",
    correctUci: "d4e6",
    answerSan: "Ne6+",
    explanation:
      "Ne6+ checks the king on g7 and unveils the rook on d1, which now attacks the queen on d8. The king must deal with the check, then Rxd8 wins the queen.",
    xpReward: 40,
    categories: ["tactics", "calculation"],
    hint: "A knight check can uncover the rook behind it.",
  },
];

/** Puzzles whose theme matches, in their authored order. */
export function puzzlesByTheme(theme: PuzzleTheme): Puzzle[] {
  return BEGINNER_PUZZLES.filter((p) => p.theme === theme);
}

/** Look up a single puzzle by id. */
export function puzzleById(id: string): Puzzle | undefined {
  return BEGINNER_PUZZLES.find((p) => p.id === id);
}
