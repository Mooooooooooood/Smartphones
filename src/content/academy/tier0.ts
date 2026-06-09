import type { PuzzleTheme } from "@/content/puzzles/beginner";

export interface Quiz {
  question: string;
  choices: string[];
  correctIndex: number;
}

export interface Lesson {
  id: string;
  tier: number;
  order: number;
  title: string;
  subtitle: string;
  explanation: string;
  keyPoints: string[];
  quiz: Quiz;
  xpReward: number;
  fen?: string; // optional illustrative position (read-only board)
  boardCaption?: string;
  /** Tier 1+ lessons point at a puzzle theme to practise the tactic. */
  relatedPuzzleTheme?: PuzzleTheme;
}

export const TIER0_TITLE = "Tier 0 · Foundations";

export const TIER0_LESSONS: Lesson[] = [
  {
    id: "coordinates",
    tier: 0,
    order: 1,
    title: "Board Coordinates",
    subtitle: "Read any square instantly",
    explanation:
      "The board is an 8x8 grid. Columns are files, labelled a to h from White's left to right. Rows are ranks, numbered 1 to 8 from White's side upward. Every square has a name like e4 — file first, then rank.",
    keyPoints: [
      "Files a-h run left to right; ranks 1-8 run bottom to top.",
      "Name a square file-then-rank, e.g. d5.",
      "The bottom-right square (h1) is always light; a1 is always dark.",
    ],
    quiz: {
      question: "Which describes the bottom-right square from White's view?",
      choices: ["a1, a dark square", "h1, a light square", "h8, a light square", "a8, a dark square"],
      correctIndex: 1,
    },
    xpReward: 50,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    boardCaption: "The starting position. White occupies ranks 1 and 2.",
  },
  {
    id: "how-pieces-move",
    tier: 0,
    order: 2,
    title: "How Pieces Move",
    subtitle: "Each piece, its path and value",
    explanation:
      "Rooks move in straight lines, bishops along diagonals, and the queen does both. Knights jump in an L-shape and are the only piece that leaps over others. The king steps one square in any direction; pawns march forward.",
    keyPoints: [
      "Rook 5, bishop 3, knight 3, queen 9, pawn 1 (the king is priceless).",
      "Only the knight can jump over other pieces.",
      "A bishop stays on one colour for the entire game.",
    ],
    quiz: {
      question: "Which piece is the only one that can jump over other pieces?",
      choices: ["Rook", "Bishop", "Knight", "Queen"],
      correctIndex: 2,
    },
    xpReward: 50,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    boardCaption: "Each side: 8 pawns, 2 rooks, 2 knights, 2 bishops, a queen, a king.",
  },
  {
    id: "captures",
    tier: 0,
    order: 3,
    title: "Captures",
    subtitle: "Taking enemy pieces",
    explanation:
      "You capture by moving a piece onto a square occupied by an enemy piece, removing it from the board. Most pieces capture the same way they move — but pawns are special: they move straight ahead yet capture one square diagonally forward.",
    keyPoints: [
      "Capture by landing on the enemy piece's square.",
      "Pawns move straight but capture diagonally.",
      "You can never capture your own pieces.",
    ],
    quiz: {
      question: "How does a pawn capture an enemy piece?",
      choices: ["Straight ahead one square", "Diagonally forward one square", "Any adjacent square", "It cannot capture"],
      correctIndex: 1,
    },
    xpReward: 50,
    fen: "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    boardCaption: "White's e4 pawn can capture the d5 pawn — pawns take diagonally.",
  },
  {
    id: "check",
    tier: 0,
    order: 4,
    title: "Check",
    subtitle: "The king under attack",
    explanation:
      "A king is in check when an enemy piece attacks its square. Check is not optional to address — you must respond immediately, on the very next move, by moving the king, blocking the attack, or capturing the attacking piece.",
    keyPoints: [
      "Check means the king is being attacked right now.",
      "You must respond at once: move, block, or capture.",
      "You can never leave or move your king into check.",
    ],
    quiz: {
      question: "When your king is in check, you must...",
      choices: ["Castle immediately", "Get out of check on this move", "Offer a draw", "Move any piece you like"],
      correctIndex: 1,
    },
    xpReward: 50,
    fen: "4k3/8/8/1B6/8/8/8/4K3 b - - 0 1",
    boardCaption: "The bishop on b5 attacks the black king — that is check.",
  },
  {
    id: "checkmate",
    tier: 0,
    order: 5,
    title: "Checkmate",
    subtitle: "How games are won",
    explanation:
      "Checkmate is check with no escape: the king is attacked and there is no legal way to remove the attack. The game ends immediately and the attacking side wins. Delivering checkmate is the goal of the game.",
    keyPoints: [
      "Checkmate = in check + no legal move to escape.",
      "The king is never actually captured — the game ends at mate.",
      "A king hemmed in by its own pieces is easier to mate.",
    ],
    quiz: {
      question: "Checkmate is when...",
      choices: [
        "The king is in check with no legal escape",
        "You capture the enemy queen",
        "A pawn promotes",
        "The king is trapped but perfectly safe",
      ],
      correctIndex: 0,
    },
    xpReward: 50,
    fen: "3R2k1/5ppp/8/8/8/8/8/6K1 b - - 0 1",
    boardCaption: "Back-rank mate: the king is checked and its own pawns block every escape.",
  },
  {
    id: "castling",
    tier: 0,
    order: 6,
    title: "Castling",
    subtitle: "King safety in one move",
    explanation:
      "Castling moves the king two squares toward a rook, and that rook hops to the king's other side — a single move that tucks the king away and activates a rook. It is only legal if neither piece has moved, the squares between are empty, and the king is not in, through, or into check.",
    keyPoints: [
      "Neither the king nor that rook may have moved before.",
      "All squares between them must be empty.",
      "You cannot castle out of, through, or into check.",
    ],
    quiz: {
      question: "You may NOT castle if...",
      choices: ["Your queen has moved", "The king has already moved", "You have fewer pawns", "It is move 10 or later"],
      correctIndex: 1,
    },
    xpReward: 50,
    fen: "r3k2r/pppq1ppp/2nb1n2/3pp3/3PP3/2NB1N2/PPPQ1PPP/R3K2R w KQkq - 0 1",
    boardCaption: "White can castle kingside: f1 and g1 are empty and nothing has moved.",
  },
  {
    id: "promotion",
    tier: 0,
    order: 7,
    title: "Promotion",
    subtitle: "Pawns reaching the end",
    explanation:
      "When a pawn reaches the far side of the board (rank 8 for White, rank 1 for Black) it must promote — it transforms into a queen, rook, bishop, or knight of its own colour. Players almost always choose a queen, the strongest piece.",
    keyPoints: [
      "A pawn reaching the last rank must become another piece.",
      "You may choose queen, rook, bishop, or knight.",
      "A queen is the usual choice; a knight is the rare exception.",
    ],
    quiz: {
      question: "A pawn that reaches the far side of the board...",
      choices: [
        "Is removed from play",
        "Promotes to another piece (usually a queen)",
        "Becomes a second king",
        "Can only become a knight",
      ],
      correctIndex: 1,
    },
    xpReward: 50,
    fen: "8/4P3/8/8/8/8/8/k5K1 w - - 0 1",
    boardCaption: "White's e7 pawn reaches e8 next move and promotes.",
  },
  {
    id: "stalemate",
    tier: 0,
    order: 8,
    title: "Stalemate",
    subtitle: "The surprising draw",
    explanation:
      "Stalemate is when the side to move has no legal move but is not in check. Unlike checkmate, no one wins — the game is an immediate draw. Knowing this saves half-points: a winning side must give the losing king a legal move until the mate is ready.",
    keyPoints: [
      "Stalemate = no legal move AND not in check.",
      "It is a draw, not a win.",
      "When ahead, avoid trapping the king with no moves too early.",
    ],
    quiz: {
      question: "Stalemate happens when the side to move...",
      choices: [
        "Is in check and cannot move",
        "Has no legal move and is not in check",
        "Runs out of time",
        "Has only a king left",
      ],
      correctIndex: 1,
    },
    xpReward: 50,
    fen: "7k/8/5KQ1/8/8/8/8/8 b - - 0 1",
    boardCaption: "Black is not in check, yet has no legal move — stalemate, a draw.",
  },
];
