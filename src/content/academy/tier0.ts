import type { PuzzleTheme } from "@/content/puzzles/beginner";
import type { BuddyPiece } from "@/components/characters/ChessBuddy";
import type { LessonStep } from "@/domain/academy/lessonSteps";

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
  /** Guide character that hosts the lesson stage. */
  guide?: BuddyPiece;
  /** Interactive stage steps. When present the lesson runs as a mini-game. */
  steps?: LessonStep[];
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
      choices: ["a1, a dark square", "h8, a light square", "h1, a light square", "a8, a dark square"],
      correctIndex: 2,
    },
    xpReward: 50,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    boardCaption: "The starting position. White occupies ranks 1 and 2.",
    guide: "bishop",
    steps: [
      {
        type: "intro",
        guide: "bishop",
        title: "Every square has a name",
        text: "Hi, I'm Bea! Before we move a single piece, let's learn the board's secret map. Once you can name squares, chess gets so much easier.",
      },
      {
        type: "board-demo",
        fen: "8/8/8/8/8/8/8/8 w - - 0 1",
        prompt: "Files go a–h across, ranks go 1–8 up.",
        caption: "A square's name is its file letter then its rank number — like e4.",
        guide: "bishop",
      },
      {
        type: "tap-square",
        fen: "8/8/8/8/8/8/8/8 w - - 0 1",
        prompt: "Find file e, rank 4. Tap the e4 square!",
        targets: ["e4"],
        successText: "That's e4 — right in the centre. Perfect!",
        hint: "Count e across (a, b, c, d, e), then 4 up.",
        showCoordinates: true,
        guide: "bishop",
      },
      {
        type: "tap-square",
        fen: "8/8/8/8/8/8/8/8 w - - 0 1",
        prompt: "The corner by White's left hand is a1. Tap a1!",
        targets: ["a1"],
        successText: "Yes — a1, always a dark square.",
        hint: "Bottom-left corner from White's side.",
        showCoordinates: true,
        guide: "bishop",
      },
      {
        type: "multiple-choice",
        prompt: "Which describes the bottom-right square from White's view?",
        choices: ["a1, a dark square", "a8, a dark square", "h8, a light square", "h1, a light square"],
        correctIndex: 3,
        successText: "h1 it is — and it's light. You can read the board now!",
        guide: "bishop",
      },
    ],
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
      choices: ["Knight", "Bishop", "Rook", "Queen"],
      correctIndex: 0,
    },
    xpReward: 50,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    boardCaption: "Each side: 8 pawns, 2 rooks, 2 knights, 2 bishops, a queen, a king.",
    guide: "knight",
    steps: [
      {
        type: "intro",
        guide: "knight",
        title: "Meet the movers",
        text: "Gallop here! Every piece has its own style of travel. The trickiest — and my favourite — is the knight, who hops in an L and jumps right over everyone.",
      },
      {
        type: "board-demo",
        fen: "8/8/8/8/4N3/8/8/8 w - - 0 1",
        prompt: "A knight on e4 can leap to eight squares in an L-shape.",
        highlights: ["d6", "f6", "c5", "g5", "c3", "g3", "d2", "f2"],
        caption: "Two squares one way, then one square to the side — and it can jump!",
        guide: "knight",
      },
      {
        type: "tap-square",
        fen: "7k/8/8/8/8/8/8/6NK w - - 0 1",
        prompt: "The knight is on g1. Tap a square it can legally jump to.",
        targets: ["e2", "f3", "h3"],
        successText: "Nice L-shaped jump! That's how knights travel.",
        hint: "From g1, think two-then-one: e2, f3, or h3.",
        guide: "knight",
      },
      {
        type: "multiple-choice",
        prompt: "Which piece is the only one that can jump over other pieces?",
        choices: ["Rook", "Knight", "Bishop", "Queen"],
        correctIndex: 1,
        successText: "The knight — the board's only jumper!",
        guide: "knight",
      },
    ],
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
      choices: ["Straight ahead one square", "Any adjacent square", "Diagonally forward one square", "It cannot capture"],
      correctIndex: 2,
    },
    xpReward: 50,
    fen: "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    boardCaption: "White's e4 pawn can capture the d5 pawn — pawns take diagonally.",
    guide: "rook",
    steps: [
      {
        type: "intro",
        guide: "rook",
        title: "Time to capture",
        text: "Bramble here. Capturing is simple: land on an enemy and it's gone! Just remember pawns are sneaky — they march straight but strike diagonally.",
      },
      {
        type: "board-demo",
        fen: "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
        prompt: "White's e4 pawn eyes the black pawn on d5 — a diagonal capture.",
        highlights: ["e4", "d5"],
        caption: "The pawn captures one square diagonally forward.",
        guide: "rook",
      },
      {
        type: "make-move",
        fen: "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
        prompt: "White to play. Capture the black pawn!",
        correctUci: "e4d5",
        successText: "Captured! exd5 wins a pawn.",
        failureText: "Pawns take diagonally — try e4 to d5.",
        hint: "Move the e4 pawn diagonally onto d5.",
        guide: "rook",
      },
      {
        type: "multiple-choice",
        prompt: "How does a pawn capture an enemy piece?",
        choices: ["Straight ahead one square", "It cannot capture", "Any adjacent square", "Diagonally forward one square"],
        correctIndex: 3,
        successText: "Diagonally forward — you've got it.",
        guide: "rook",
      },
    ],
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
      choices: ["Get out of check on this move", "Castle immediately", "Offer a draw", "Move any piece you like"],
      correctIndex: 0,
    },
    xpReward: 50,
    fen: "4k3/8/8/1B6/8/8/8/4K3 b - - 0 1",
    boardCaption: "The bishop on b5 attacks the black king — that is check.",
    guide: "queen",
    steps: [
      {
        type: "intro",
        guide: "queen",
        title: "The king is attacked!",
        text: "Vera here. When a piece attacks the enemy king, that's check — and the king must escape at once. Let's learn to spot the attacker.",
      },
      {
        type: "board-demo",
        fen: "4k3/8/8/1B6/8/8/8/4K3 b - - 0 1",
        prompt: "The bishop slices down the long diagonal to the black king.",
        highlights: ["b5", "e8"],
        caption: "Bishop on b5 attacks e8 — the king is in check.",
        guide: "queen",
      },
      {
        type: "tap-piece",
        fen: "4k3/8/8/1B6/8/8/8/4K3 b - - 0 1",
        prompt: "The black king is in check! Tap the piece giving check.",
        targets: ["b5"],
        successText: "Right — the b5 bishop is the attacker.",
        hint: "Follow the diagonal back from the king.",
        guide: "queen",
      },
      {
        type: "multiple-choice",
        prompt: "When your king is in check, you must...",
        choices: ["Castle immediately", "Get out of check on this move", "Offer a draw", "Move any piece you like"],
        correctIndex: 1,
        successText: "Exactly — deal with check immediately.",
        guide: "queen",
      },
    ],
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
        "A pawn promotes",
        "You capture the enemy queen",
        "The king is in check with no legal escape",
        "The king is trapped but perfectly safe",
      ],
      correctIndex: 2,
    },
    xpReward: 50,
    fen: "6k1/5ppp/8/8/8/8/8/3R2K1 w - - 0 1",
    boardCaption: "Back-rank mate: the rook checks and the king's own pawns block escape.",
    guide: "king",
    steps: [
      {
        type: "intro",
        guide: "king",
        title: "The winning blow",
        text: "Cassius here, Academy master. Checkmate ends the game — a check the king simply cannot escape. Let's deliver one together.",
      },
      {
        type: "board-demo",
        fen: "6k1/5ppp/8/8/8/8/8/3R2K1 w - - 0 1",
        prompt: "The black king hides behind its own pawns on the back rank.",
        highlights: ["d8", "g8"],
        caption: "If a rook reaches the 8th rank, the king has nowhere to run.",
        guide: "king",
      },
      {
        type: "make-move",
        fen: "6k1/5ppp/8/8/8/8/8/3R2K1 w - - 0 1",
        prompt: "Mate in one! Send the rook to the back rank.",
        correctUci: "d1d8",
        successText: "Checkmate! Rd8# — a classic back-rank mate.",
        failureText: "Aim the rook at the 8th rank where the king is trapped.",
        hint: "Rook from d1 all the way to d8.",
        guide: "king",
      },
      {
        type: "multiple-choice",
        prompt: "Checkmate is when...",
        choices: [
          "The king is trapped but perfectly safe",
          "You capture the enemy queen",
          "A pawn promotes",
          "The king is in check with no legal escape",
        ],
        correctIndex: 3,
        successText: "In check with no escape — game over!",
        guide: "king",
      },
    ],
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
      choices: ["The king has already moved", "Your queen has moved", "You have fewer pawns", "It is move 10 or later"],
      correctIndex: 0,
    },
    xpReward: 50,
    fen: "r3k2r/pppq1ppp/2nb1n2/3pp3/3PP3/2NB1N2/PPPQ1PPP/R3K2R w KQkq - 0 1",
    boardCaption: "White can castle kingside: f1 and g1 are empty and nothing has moved.",
    guide: "rook",
    steps: [
      {
        type: "intro",
        guide: "rook",
        title: "Tuck your king away",
        text: "Bramble again! Castling is the one move where two pieces move at once — the king dashes to safety and a rook springs into action.",
      },
      {
        type: "board-demo",
        fen: "r3k2r/pppq1ppp/2nb1n2/3pp3/3PP3/2NB1N2/PPPQ1PPP/R3K2R w KQkq - 0 1",
        prompt: "f1 and g1 are clear, and nothing has moved yet.",
        highlights: ["e1", "g1", "h1"],
        caption: "King e1 → g1, rook h1 → f1, all in one move.",
        guide: "rook",
      },
      {
        type: "make-move",
        fen: "r3k2r/pppq1ppp/2nb1n2/3pp3/3PP3/2NB1N2/PPPQ1PPP/R3K2R w KQkq - 0 1",
        prompt: "Castle kingside — move your king two squares to g1.",
        correctUci: "e1g1",
        successText: "Castled! King safe, rook activated. 0-0!",
        failureText: "Castle by moving the king from e1 to g1.",
        hint: "Tap the king on e1, then tap g1.",
        guide: "rook",
      },
      {
        type: "multiple-choice",
        prompt: "You may NOT castle if...",
        choices: ["Your queen has moved", "The king has already moved", "You have fewer pawns", "It is move 10 or later"],
        correctIndex: 1,
        successText: "Right — a king that has moved loses the right to castle.",
        guide: "rook",
      },
    ],
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
        "Becomes a second king",
        "Promotes to another piece (usually a queen)",
        "Can only become a knight",
      ],
      correctIndex: 2,
    },
    xpReward: 50,
    fen: "8/4P3/8/8/8/8/8/k5K1 w - - 0 1",
    boardCaption: "White's e7 pawn reaches e8 next move and promotes.",
    guide: "queen",
    steps: [
      {
        type: "intro",
        guide: "queen",
        title: "A pawn's big dream",
        text: "Vera here. A humble pawn that marches all the way to the far side transforms — usually into a mighty queen like me. Let's crown one!",
      },
      {
        type: "board-demo",
        fen: "8/4P3/8/8/8/8/8/k5K1 w - - 0 1",
        prompt: "The e7 pawn is one step from the end of the board.",
        highlights: ["e7", "e8"],
        caption: "Reaching e8, the pawn must become a new piece.",
        guide: "queen",
      },
      {
        type: "make-move",
        fen: "8/4P3/8/8/8/8/8/k5K1 w - - 0 1",
        prompt: "Push the pawn to e8 and promote it to a queen!",
        correctUci: "e7e8q",
        successText: "A brand-new queen is born! e8=Q.",
        failureText: "March the e7 pawn straight to e8.",
        hint: "Move the e7 pawn forward to e8.",
        guide: "queen",
      },
      {
        type: "multiple-choice",
        prompt: "A pawn that reaches the far side of the board...",
        choices: [
          "Is removed from play",
          "Can only become a knight",
          "Becomes a second king",
          "Promotes to another piece (usually a queen)",
        ],
        correctIndex: 3,
        successText: "It promotes — usually to a queen!",
        guide: "queen",
      },
    ],
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
        "Has no legal move and is not in check",
        "Is in check and cannot move",
        "Runs out of time",
        "Has only a king left",
      ],
      correctIndex: 0,
    },
    xpReward: 50,
    fen: "7k/8/5KQ1/8/8/8/8/8 b - - 0 1",
    boardCaption: "Black is not in check, yet has no legal move — stalemate, a draw.",
    guide: "king",
    steps: [
      {
        type: "intro",
        guide: "king",
        title: "The sneaky draw",
        text: "Cassius here. Beware stalemate! If the player to move has no legal move but is NOT in check, the game is a draw — even if you're far ahead.",
      },
      {
        type: "board-demo",
        fen: "7k/8/5KQ1/8/8/8/8/8 b - - 0 1",
        prompt: "Black must move, but every square is covered — and the king is NOT in check.",
        highlights: ["h8", "g8", "h7", "g7"],
        caption: "No legal move + not in check = stalemate, a draw.",
        guide: "king",
      },
      {
        type: "tap-piece",
        fen: "7k/8/5KQ1/8/8/8/8/8 b - - 0 1",
        prompt: "It's Black's turn. Tap the king that is completely stuck.",
        targets: ["h8"],
        successText: "That king can't move and isn't in check — stalemate!",
        hint: "The lone black king sits in the corner on h8.",
        guide: "king",
      },
      {
        type: "true-false",
        prompt: "True or false: this position is a draw, not a win for White.",
        answer: true,
        successText: "True — stalemate is always a draw. Half a point each!",
        guide: "king",
      },
    ],
  },
];
