import type { Lesson } from "./tier0";

export const TIER3_TITLE = "Tier 3 · Endgames";

/**
 * Tier 3 — Endgames. Seven lessons on the phase where most beginner games are
 * really decided: an active king, the opposition, the rule of the square,
 * escorting a passed pawn, promotion, and the two basic checkmates (K+Q and
 * K+R vs lone king). Original content; FENs are simple, legal positions.
 */
export const TIER3_LESSONS: Lesson[] = [
  {
    id: "t3-king-activity",
    tier: 3,
    order: 1,
    title: "Activate Your King",
    subtitle: "In the endgame, the king fights",
    explanation:
      "In the opening and middlegame you hide the king. In the endgame, with few pieces left and little mating danger, the king becomes a strong attacker — worth about four points of fighting power. March it toward the centre and into the action.",
    keyPoints: [
      "With queens off the board, the king is a fighting piece.",
      "Centralise the king in the endgame.",
      "An active king escorts pawns and attacks weaknesses.",
    ],
    quiz: {
      question: "How should you use your king in an endgame?",
      choices: ["Keep it in the corner", "Trade it off", "Never move it", "Centralise it and use it to fight"],
      correctIndex: 3,
    },
    xpReward: 80,
    fen: "8/4k3/8/8/8/8/4K3/8 w - - 0 1",
    boardCaption: "With the board nearly empty, march the king toward the centre.",
    guide: "king",
    steps: [
      { type: "intro", guide: "king", title: "Time to lead", text: "Cassius here. In the endgame I stop hiding and start fighting. Bring your king out — it's one of your strongest pieces now." },
      { type: "board-demo", fen: "8/4k3/8/8/8/8/4K3/8 w - - 0 1", highlights: ["e2", "e4", "e5"], prompt: "Almost nothing left on the board.", caption: "No danger to the king — so march it up toward the centre.", guide: "king" },
      { type: "make-move", fen: "8/4k3/8/8/8/8/4K3/8 w - - 0 1", correctUci: "e2e3", prompt: "Step the king toward the centre.", successText: "The king strides forward — exactly right in an endgame.", failureText: "Advance your king up the board (e2 to e3).", hint: "King e2 to e3.", guide: "king" },
      { type: "multiple-choice", prompt: "How should you use your king in an endgame?", choices: ["Centralise it and use it to fight", "Keep it in the corner", "Never move it", "Trade it off"], correctIndex: 0, successText: "An active king wins endgames.", guide: "king" },
    ],
  },
  {
    id: "t3-opposition",
    tier: 3,
    order: 2,
    title: "The Opposition",
    subtitle: "Kings face off",
    explanation:
      "When the two kings stand on the same line with exactly one square between them, the player who does NOT have to move holds 'the opposition' and controls the squares ahead. Taking the opposition is the key to winning king-and-pawn endings — you force the enemy king to give ground.",
    keyPoints: [
      "Opposition: kings one square apart, and it's the OTHER side to move.",
      "The side with the opposition makes the enemy king step aside.",
      "It is the central technique of king-and-pawn endgames.",
    ],
    quiz: {
      question: "You 'have the opposition' when…",
      choices: ["Your king is on the edge", "You have more pawns", "The kings are one square apart and it's your opponent to move", "Your king is in check"],
      correctIndex: 2,
    },
    xpReward: 80,
    fen: "8/3k4/8/8/8/3K4/8/8 w - - 0 1",
    boardCaption: "March the king up to face the enemy king and seize the opposition.",
    guide: "king",
    steps: [
      { type: "intro", guide: "king", title: "A staring contest", text: "Cassius again. Endgame kings duel by standing one square apart. Whoever does NOT have to move wins the stand-off — that's the opposition." },
      { type: "board-demo", fen: "8/3k4/8/8/8/3K4/8/8 w - - 0 1", highlights: ["d7", "d3", "d5"], prompt: "The kings are far apart on the d-file.", caption: "Advance to d4 to face the enemy king one square away.", guide: "king" },
      { type: "tap-square", fen: "8/3k4/8/8/8/3K4/8/8 w - - 0 1", prompt: "Tap the square to march your king toward to grab the opposition.", targets: ["d4"], successText: "d4 — stepping up to face the enemy king.", hint: "Advance straight up the d-file to d4.", guide: "king" },
      { type: "multiple-choice", prompt: "You 'have the opposition' when…", choices: ["Your king is on the edge", "The kings are one square apart and it's your opponent to move", "You have more pawns", "Your king is in check"], correctIndex: 1, successText: "Right — the other side must give way.", guide: "king" },
    ],
  },
  {
    id: "t3-square-rule",
    tier: 3,
    order: 3,
    title: "The Rule of the Square",
    subtitle: "Can the king catch the pawn?",
    explanation:
      "To know instantly whether a lone king can stop a runaway passed pawn, picture the square whose side runs from the pawn to its promotion rank. If the enemy king can step into that square, it catches the pawn; if not, the pawn queens. No counting moves needed.",
    keyPoints: [
      "Draw the square from the pawn to its promotion rank.",
      "If the king can step into the square, it catches the pawn.",
      "If it can't, the pawn promotes — just push.",
    ],
    quiz: {
      question: "The rule of the square tells you…",
      choices: ["Which pawn to promote", "The value of a rook", "How to castle", "Whether a king can catch a passed pawn"],
      correctIndex: 3,
    },
    xpReward: 80,
    fen: "8/8/8/8/7P/8/8/k6K w - - 0 1",
    boardCaption: "The black king is far outside the h-pawn's square — it can't catch it.",
    guide: "pawn",
    steps: [
      { type: "intro", guide: "pawn", title: "A pawn's footrace", text: "Pip here! When my pawn pal makes a run for it, the square trick tells you instantly if the king can catch it. Spoiler: often it can't." },
      { type: "board-demo", fen: "8/8/8/8/7P/8/8/k6K w - - 0 1", highlights: ["h4", "h8", "a1"], prompt: "The pawn runs up the h-file; the king is stuck on a1.", caption: "The king is far outside the pawn's square — the pawn will queen.", guide: "pawn" },
      { type: "tap-square", fen: "8/8/8/8/7P/8/8/k6K w - - 0 1", prompt: "Tap the square the running pawn is racing to.", targets: ["h8"], successText: "h8 — the promotion square the king can't reach in time.", hint: "Follow the h-pawn straight up to the last rank.", guide: "pawn" },
      { type: "multiple-choice", prompt: "The rule of the square tells you…", choices: ["Whether a king can catch a passed pawn", "Which pawn to promote", "How to castle", "The value of a rook"], correctIndex: 0, successText: "Catch it or queen it — the square decides.", guide: "pawn" },
    ],
  },
  {
    id: "t3-king-pawn",
    tier: 3,
    order: 4,
    title: "King and Pawn",
    subtitle: "Lead the pawn home",
    explanation:
      "A single extra pawn often wins — but only if the king leads, not the pawn. Keep your king in FRONT of the pawn to clear a path to the queening square. A pawn pushed alone is easily blockaded by the enemy king.",
    keyPoints: [
      "Put the king in front of the pawn, not behind it.",
      "The king clears the way; the pawn follows.",
      "Pushing the pawn too early lets the enemy king block it.",
    ],
    quiz: {
      question: "In a king-and-pawn ending, your king should be…",
      choices: ["Behind the pawn", "In the corner", "In front of the pawn, leading it", "Anywhere — it doesn't matter"],
      correctIndex: 2,
    },
    xpReward: 80,
    fen: "8/8/8/3k4/8/3P4/3K4/8 w - - 0 1",
    boardCaption: "The king must step in front of the d-pawn to escort it forward.",
    guide: "king",
    steps: [
      { type: "intro", guide: "king", title: "Kings lead, pawns follow", text: "Cassius here. An extra pawn wins — if I go first. Keep your king ahead of the pawn to bulldoze a path to promotion." },
      { type: "board-demo", fen: "8/8/8/3k4/8/3P4/3K4/8 w - - 0 1", highlights: ["d2", "d3", "d4"], prompt: "Don't shove the pawn yet.", caption: "Lead with the king to d4-side so the pawn has a clear road.", guide: "king" },
      { type: "tap-square", fen: "8/8/8/3k4/8/3P4/3K4/8 w - - 0 1", prompt: "Tap a square that puts your king in FRONT of its pawn.", targets: ["c3", "e3"], successText: "Yes — the king steps up beside and ahead of the pawn to lead it.", hint: "Move the king up and to the side of the d3 pawn (c3 or e3).", guide: "king" },
      { type: "multiple-choice", prompt: "In a king-and-pawn ending, your king should be…", choices: ["Behind the pawn", "In front of the pawn, leading it", "In the corner", "Anywhere — it doesn't matter"], correctIndex: 1, successText: "King first — every time.", guide: "king" },
    ],
  },
  {
    id: "t3-promotion",
    tier: 3,
    order: 5,
    title: "Promote the Pawn",
    subtitle: "Turn a pawn into a queen",
    explanation:
      "The whole point of an extra pawn in the endgame is to march it to the far rank and promote — almost always to a queen, the most powerful piece. Once you have a new queen, the basic checkmate is easy.",
    keyPoints: [
      "Escort the passed pawn to the last rank.",
      "Promote to a queen unless a knight gives immediate mate.",
      "A fresh queen turns a tiny edge into a win.",
    ],
    quiz: {
      question: "A pawn reaching the last rank usually becomes a…",
      choices: ["Second king", "Bishop", "Pawn again", "Queen"],
      correctIndex: 3,
    },
    xpReward: 80,
    fen: "8/2P5/8/8/8/8/k7/6K1 w - - 0 1",
    boardCaption: "The c7 pawn steps to c8 and crowns itself a queen.",
    guide: "queen",
    steps: [
      { type: "intro", guide: "queen", title: "A new queen is born", text: "Vera here. March that brave pawn to the end of the board and crown it — preferably into a queen like me." },
      { type: "board-demo", fen: "8/2P5/8/8/8/8/k7/6K1 w - - 0 1", highlights: ["c7", "c8"], prompt: "One step to glory.", caption: "Reaching c8, the pawn must become a new piece.", guide: "queen" },
      { type: "make-move", fen: "8/2P5/8/8/8/8/k7/6K1 w - - 0 1", correctUci: "c7c8q", prompt: "Promote the pawn to a queen!", successText: "c8=Q! A brand-new queen.", failureText: "Push the c7 pawn to c8 and make it a queen.", hint: "Pawn c7 to c8.", guide: "queen" },
      { type: "multiple-choice", prompt: "A pawn reaching the last rank usually becomes a…", choices: ["Queen", "Second king", "Pawn again", "Bishop"], correctIndex: 0, successText: "A queen — the strongest choice.", guide: "queen" },
    ],
  },
  {
    id: "t3-queen-mate",
    tier: 3,
    order: 6,
    title: "Queen Checkmate",
    subtitle: "King and queen vs lone king",
    explanation:
      "King and queen against a bare king is the most common winning checkmate. The technique: use the queen to herd the enemy king to the edge, bring your own king up to support, and deliver mate on the rim. The king must always guard the queen's mating square.",
    keyPoints: [
      "Drive the lone king to the edge with the queen.",
      "Your king must support the queen for mate.",
      "Beware stalemate — always leave the enemy king a move until mate.",
    ],
    quiz: {
      question: "To mate with king and queen, you must…",
      choices: ["Only use the queen", "Give checks forever", "Bring your king up to support the queen", "Promote another pawn"],
      correctIndex: 2,
    },
    xpReward: 90,
    fen: "k7/8/1QK5/8/8/8/8/8 w - - 0 1",
    boardCaption: "Qb7# — the king on c6 guards the queen as it mates.",
    guide: "queen",
    steps: [
      { type: "intro", guide: "queen", title: "The royal finish", text: "Vera here. King and queen versus a lone king is the mate you'll use most. The secret: my king must stand guard so I can step in for the kill." },
      { type: "board-demo", fen: "k7/8/1QK5/8/8/8/8/8 w - - 0 1", highlights: ["a8", "b7", "c6"], prompt: "The black king is trapped on the edge; your king guards b7.", caption: "With the king on c6 supporting, the queen mates on b7.", guide: "queen" },
      { type: "make-move", fen: "k7/8/1QK5/8/8/8/8/8 w - - 0 1", correctUci: "b6b7", prompt: "Deliver checkmate with the queen — your king has its back.", successText: "Qb7#! Supported by the king — a textbook mate.", failureText: "Move the queen next to the enemy king where your king defends it.", hint: "Queen b6 to b7.", guide: "queen" },
      { type: "multiple-choice", prompt: "To mate with king and queen, you must…", choices: ["Only use the queen", "Bring your king up to support the queen", "Give checks forever", "Promote another pawn"], correctIndex: 1, successText: "King + queen together — that's the mate.", guide: "queen" },
    ],
  },
  {
    id: "t3-rook-mate",
    tier: 3,
    order: 7,
    title: "Rook Checkmate",
    subtitle: "King and rook vs lone king",
    explanation:
      "King and rook also mate a lone king. Use your king and rook as a team to push the enemy king to the edge, then check it along the back rank while your king holds the escape squares. This 'ladder' mate is a must-know endgame.",
    keyPoints: [
      "Box the enemy king toward the edge with king and rook.",
      "Mate by checking along the edge with your king opposite.",
      "Keep the rook safe from the enemy king as you push.",
    ],
    quiz: {
      question: "Mating with king and rook relies on…",
      choices: ["The rook alone", "A second rook", "Endless checks", "Your king controlling the escape squares while the rook checks"],
      correctIndex: 3,
    },
    xpReward: 90,
    fen: "7k/R7/6K1/8/8/8/8/8 w - - 0 1",
    boardCaption: "Ra8# — the king on g6 covers g7 and h7 while the rook mates.",
    guide: "rook",
    steps: [
      { type: "intro", guide: "rook", title: "The ladder mate", text: "Bramble here. King and rook is a team effort: my king takes away the escapes, then the rook slams down for mate along the edge." },
      { type: "board-demo", fen: "7k/R7/6K1/8/8/8/8/8 w - - 0 1", highlights: ["h8", "g7", "h7"], prompt: "Your king already guards g7 and h7.", caption: "All escapes are covered — the rook delivers mate on the 8th rank.", guide: "rook" },
      { type: "make-move", fen: "7k/R7/6K1/8/8/8/8/8 w - - 0 1", correctUci: "a7a8", prompt: "Deliver mate — rook to the back rank!", successText: "Ra8#! The king has no escape — a clean rook mate.", failureText: "Check along the 8th rank where the king can't escape.", hint: "Rook a7 to a8.", guide: "rook" },
      { type: "multiple-choice", prompt: "Mating with king and rook relies on…", choices: ["Your king controlling the escape squares while the rook checks", "The rook alone", "Endless checks", "A second rook"], correctIndex: 0, successText: "Teamwork — king and rook together.", guide: "rook" },
    ],
  },
];
