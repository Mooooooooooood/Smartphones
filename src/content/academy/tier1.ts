import type { Lesson } from "./tier0";

export const TIER1_TITLE = "Tier 1 · First Tactics";

/**
 * Tier 1 — First Tactics. Eight structured lessons that each teach one
 * tactical idea and point at a matching puzzle theme for practice.
 * Original content; FENs are simple illustrative positions.
 */
export const TIER1_LESSONS: Lesson[] = [
  {
    id: "t1-piece-values",
    tier: 1,
    order: 1,
    title: "Piece Values and Trades",
    subtitle: "Know what each piece is worth",
    explanation:
      "Before you can win material you need to know what material is worth. A pawn is 1, knight and bishop 3, rook 5, and the queen 9. A 'good trade' means giving up less value than you get back. When the totals are equal it is an even trade; grabbing a rook for a bishop wins 'the exchange'.",
    keyPoints: [
      "Pawn 1, knight 3, bishop 3, rook 5, queen 9.",
      "Trade when you gain value or improve your position.",
      "Winning a rook for a minor piece is 'winning the exchange'.",
    ],
    quiz: {
      question: "You can take a rook but lose your bishop doing so. Is that a good trade?",
      choices: ["No, never trade", "Yes — 5 for 3 wins material", "Only if you are losing", "It is an even trade"],
      correctIndex: 1,
    },
    xpReward: 60,
    relatedPuzzleTheme: "undefended-capture",
  },
  {
    id: "t1-hanging-pieces",
    tier: 1,
    order: 2,
    title: "Hanging Pieces",
    subtitle: "Take what is left undefended",
    explanation:
      "A hanging piece is one that is not defended by anything. If your opponent leaves a piece hanging, you can simply capture it for free. Always scan the board for undefended enemy pieces before you move — and make sure your own pieces are defended too.",
    keyPoints: [
      "A hanging piece has no defender.",
      "Capturing a hanging piece wins material for free.",
      "Check your own pieces are defended before moving.",
    ],
    quiz: {
      question: "What makes a piece 'hanging'?",
      choices: ["It is pinned", "It has no defender", "It is on the edge", "It gives check"],
      correctIndex: 1,
    },
    xpReward: 60,
    fen: "4k3/8/8/3b4/8/4N3/8/4K3 w - - 0 1",
    boardCaption: "The black bishop on d5 is undefended — Nxd5 wins it.",
    relatedPuzzleTheme: "hanging-piece",
  },
  {
    id: "t1-forks",
    tier: 1,
    order: 3,
    title: "Forks",
    subtitle: "One piece, two targets",
    explanation:
      "A fork is a single move that attacks two or more enemy pieces at once. Knights are famous forkers because they hit squares no other piece can defend easily. When you fork the king and another piece, the opponent must save the king and you win the other piece.",
    keyPoints: [
      "A fork attacks two targets at the same time.",
      "Knight forks of king and queen are devastating.",
      "Look for forks whenever enemy pieces line up a knight-move apart.",
    ],
    quiz: {
      question: "Why is a knight fork on the king and queen so strong?",
      choices: [
        "The king must move, so the queen is lost",
        "It gives checkmate",
        "Knights cannot be captured",
        "It promotes a pawn",
      ],
      correctIndex: 0,
    },
    xpReward: 60,
    fen: "4k3/8/8/3q4/6N1/8/8/4K3 w - - 0 1",
    boardCaption: "Nf6+ forks the king on e8 and the queen on d5.",
    relatedPuzzleTheme: "fork",
  },
  {
    id: "t1-pins",
    tier: 1,
    order: 4,
    title: "Pins",
    subtitle: "Freeze a piece in place",
    explanation:
      "A pin is when a piece cannot move because doing so would expose a more valuable piece behind it. In an absolute pin the piece behind is the king, so the pinned piece is legally stuck. Pile more attackers onto a pinned piece — it cannot run away.",
    keyPoints: [
      "A pin holds a piece in front of a more valuable one.",
      "An absolute pin is against the king — the piece truly cannot move.",
      "Attack a pinned piece again to win it.",
    ],
    quiz: {
      question: "A knight is pinned to its king. What can you do?",
      choices: [
        "Nothing, pins are harmless",
        "Attack the knight again to win it",
        "The knight can still jump away",
        "Only give check",
      ],
      correctIndex: 1,
    },
    xpReward: 60,
    fen: "4k3/4n3/3P4/8/8/8/8/4R1K1 w - - 0 1",
    boardCaption: "The e7-knight is pinned by the rook — dxe7 wins it.",
    relatedPuzzleTheme: "pin",
  },
  {
    id: "t1-skewers",
    tier: 1,
    order: 5,
    title: "Skewers",
    subtitle: "The pin, reversed",
    explanation:
      "A skewer is like a pin turned around: the more valuable piece is in front and is forced to move, exposing the piece behind it. Check the king along a line, the king steps aside, and you capture the rook or queen that was hiding behind it.",
    keyPoints: [
      "In a skewer the valuable piece is in front and must move.",
      "Rooks, bishops and queens deliver skewers along lines.",
      "Skewer the king to win the piece behind it.",
    ],
    quiz: {
      question: "How does a skewer differ from a pin?",
      choices: [
        "It only uses knights",
        "The more valuable piece is in front and must move",
        "It never gives check",
        "There is no difference",
      ],
      correctIndex: 1,
    },
    xpReward: 60,
    fen: "3q4/8/8/8/3k4/8/8/R5K1 w - - 0 1",
    boardCaption: "Rd1+ skewers the king to the queen behind it.",
    relatedPuzzleTheme: "skewer",
  },
  {
    id: "t1-discovered-attacks",
    tier: 1,
    order: 6,
    title: "Discovered Attacks",
    subtitle: "Move one piece, unleash another",
    explanation:
      "A discovered attack happens when you move one piece out of the way and the piece behind it suddenly attacks. If the moving piece also gives check or makes a threat, the opponent cannot answer both — that is a discovered double threat, one of the most powerful tactics.",
    keyPoints: [
      "Moving a front piece reveals an attack from the piece behind.",
      "Discovered checks are especially strong — two threats at once.",
      "Look for your own pieces lined up behind a movable piece.",
    ],
    quiz: {
      question: "What powers a discovered attack?",
      choices: [
        "A piece moving aside to reveal another's attack",
        "Castling",
        "Promoting a pawn",
        "A pin",
      ],
      correctIndex: 0,
    },
    xpReward: 60,
    fen: "2q1k3/8/8/8/4N3/8/8/4R1K1 w - - 0 1",
    boardCaption: "Nd6+ is a discovered double check — then Nxc8 wins the queen.",
    relatedPuzzleTheme: "discovered-attack",
  },
  {
    id: "t1-removing-the-defender",
    tier: 1,
    order: 7,
    title: "Removing the Defender",
    subtitle: "Take out the guard",
    explanation:
      "Sometimes a piece or a key square is only held up by a single defender. Capture or chase away that defender and the thing it was protecting falls. Always ask: what is defending the piece I want — and can I remove it?",
    keyPoints: [
      "Find the one piece holding a square or piece together.",
      "Capture or deflect that defender.",
      "What it was guarding now collapses.",
    ],
    quiz: {
      question: "A rook is the only piece guarding the back rank. What is the plan?",
      choices: [
        "Ignore it",
        "Remove or trade that rook, then mate",
        "Offer a draw",
        "Push a pawn",
      ],
      correctIndex: 1,
    },
    xpReward: 60,
    fen: "3r2k1/5ppp/8/8/8/8/8/3R2K1 w - - 0 1",
    boardCaption: "Rxd8# removes the lone defender and mates.",
    relatedPuzzleTheme: "remove-defender",
  },
  {
    id: "t1-mate-in-one",
    tier: 1,
    order: 8,
    title: "Mate in One Patterns",
    subtitle: "Spot the finishing blow",
    explanation:
      "The goal of every tactic is checkmate. Train your eye to spot mate in one: a check the king cannot escape, block, or capture out of. Back-rank mates, supported queen mates, and corner mates are the patterns you will see again and again.",
    keyPoints: [
      "Mate in one is a check with no legal reply.",
      "Watch for trapped kings on the back rank.",
      "A supported queen next to the king is often mate.",
    ],
    quiz: {
      question: "What defines checkmate?",
      choices: [
        "The king is in check with no legal move",
        "The queen is captured",
        "A pawn promotes",
        "The king is in the centre",
      ],
      correctIndex: 0,
    },
    xpReward: 60,
    fen: "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1",
    boardCaption: "Ra8# — the king is trapped by its own pawns.",
    relatedPuzzleTheme: "mate-in-1",
  },
];
