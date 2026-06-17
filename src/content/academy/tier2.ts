import type { Lesson } from "./tier0";

export const TIER2_TITLE = "Tier 2 · Positional Play";

/**
 * Tier 2 — Positional Play. Seven lessons on the strategic ideas that decide
 * games once both sides know the rules and basic tactics: the centre,
 * development, king safety, open files, active pieces, pawn health, and
 * outposts. Original content; FENs are simple, legal, illustrative positions.
 */
export const TIER2_LESSONS: Lesson[] = [
  {
    id: "t2-center",
    tier: 2,
    order: 1,
    title: "Control the Center",
    subtitle: "The four squares that matter most",
    explanation:
      "The centre — e4, d4, e5, d5 — is the high ground of the board. Pieces placed there reach the most squares, and pawns there cramp your opponent. Almost every strong opening begins by claiming the centre with a pawn.",
    keyPoints: [
      "Central pawns control key squares and open lines for your pieces.",
      "A piece in the centre attacks more squares than one on the edge.",
      "Start most games by playing a central pawn two squares.",
    ],
    quiz: {
      question: "Why fight for the centre?",
      choices: ["It looks nice", "It wins material instantly", "Central pieces and pawns control more of the board", "It is required by the rules"],
      correctIndex: 2,
    },
    xpReward: 70,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    boardCaption: "From the start, 1.e4 stakes a claim in the centre.",
    guide: "knight",
    steps: [
      { type: "intro", guide: "knight", title: "Claim the high ground", text: "Gallop here! The four centre squares are the board's hilltop. Grab them with a pawn and your pieces get the best views." },
      { type: "board-demo", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", highlights: ["e4", "d4", "e5", "d5"], prompt: "These four squares are the centre.", caption: "Whoever controls e4/d4/e5/d5 controls the game.", guide: "knight" },
      { type: "make-move", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", correctUci: "e2e4", prompt: "Open the game by claiming the centre — push the e-pawn two squares.", successText: "1.e4! A classic central grab.", failureText: "Play a central pawn forward two squares (e2 to e4).", hint: "Move the e-pawn from e2 to e4.", guide: "knight" },
      { type: "multiple-choice", prompt: "Why fight for the centre?", choices: ["It looks nice", "Central pieces and pawns control more of the board", "It wins material instantly", "It is required by the rules"], correctIndex: 1, successText: "Right — the centre is where pieces are strongest.", guide: "knight" },
    ],
  },
  {
    id: "t2-develop",
    tier: 2,
    order: 2,
    title: "Develop Your Pieces",
    subtitle: "Get everyone into the game",
    explanation:
      "Development means bringing your knights and bishops off the back rank to active squares. In the opening, develop a new piece every move, get the knights out toward the centre, and try not to move the same piece twice before everything is out.",
    keyPoints: [
      "Develop toward the centre — knights to f3/c3, bishops to active diagonals.",
      "Aim to move a different piece each turn in the opening.",
      "Don't bring the queen out too early; she becomes a target.",
    ],
    quiz: {
      question: "Good opening development means…",
      choices: ["Moving pawns only", "Trading every piece", "Marching the king up", "Bringing knights and bishops out toward the centre"],
      correctIndex: 3,
    },
    xpReward: 70,
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    boardCaption: "1.e4 e5 — now develop a knight: Nf3 attacks e5 and eyes the centre.",
    guide: "bishop",
    steps: [
      { type: "intro", guide: "bishop", title: "Wake your army", text: "Bea here. Pawns alone can't win — bring your knights and bishops out to fight. A knight toward the centre is a great first developer." },
      { type: "board-demo", fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2", highlights: ["g1", "f3", "e5"], prompt: "The g1 knight wants an active square.", caption: "Nf3 develops a piece AND attacks the e5 pawn.", guide: "bishop" },
      { type: "make-move", fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2", correctUci: "g1f3", prompt: "Develop your knight to its best square.", successText: "Nf3! Developed and attacking e5.", failureText: "Bring the g1 knight out to f3.", hint: "Knight g1 to f3.", guide: "bishop" },
      { type: "multiple-choice", prompt: "Good opening development means…", choices: ["Bringing knights and bishops out toward the centre", "Moving pawns only", "Marching the king up", "Trading every piece"], correctIndex: 0, successText: "Exactly — get your pieces into the game.", guide: "bishop" },
    ],
  },
  {
    id: "t2-castle-early",
    tier: 2,
    order: 3,
    title: "Castle Early",
    subtitle: "Tuck the king to safety",
    explanation:
      "A king in the centre is exposed once lines open. Castling in the first ten moves whisks the king to the corner behind a wall of pawns and connects your rooks. As a rule: develop a couple of pieces, then castle.",
    keyPoints: [
      "Castle early — usually within the first ten moves.",
      "Castling hides the king and activates a rook in one move.",
      "Keep the pawns in front of your castled king intact.",
    ],
    quiz: {
      question: "Why castle early?",
      choices: ["To win a pawn", "It is the only legal move", "To get the king safe and connect the rooks", "To promote faster"],
      correctIndex: 2,
    },
    xpReward: 70,
    fen: "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1",
    boardCaption: "Pieces are out and f1/g1 are clear — time to castle kingside.",
    guide: "rook",
    steps: [
      { type: "intro", guide: "rook", title: "King to the corner", text: "Bramble here. Once your knight and bishop are out, get the king to safety. Castling does it in a single, satisfying move." },
      { type: "board-demo", fen: "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1", highlights: ["e1", "g1", "h1"], prompt: "The path between king and rook is clear.", caption: "King e1 → g1, rook h1 → f1, all in one move.", guide: "rook" },
      { type: "make-move", fen: "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1", correctUci: "e1g1", prompt: "Castle kingside — king two squares to g1.", successText: "0-0! King safe, rook activated.", failureText: "Castle by moving the king from e1 to g1.", hint: "Tap the king on e1, then g1.", guide: "rook" },
      { type: "multiple-choice", prompt: "Why castle early?", choices: ["To win a pawn", "To get the king safe and connect the rooks", "It is the only legal move", "To promote faster"], correctIndex: 1, successText: "Safety first — then attack.", guide: "rook" },
    ],
  },
  {
    id: "t2-open-files",
    tier: 2,
    order: 4,
    title: "Rooks Love Open Files",
    subtitle: "Put rooks where they breathe",
    explanation:
      "A rook is clumsy behind its own pawns but powerful on an open file — a column with no pawns. Rooks placed on open (or half-open) files rake the enemy position and often invade the 7th rank. When a file opens, race a rook to it.",
    keyPoints: [
      "An open file has no pawns of either colour.",
      "Rooks belong on open or half-open files.",
      "A rook reaching the 7th rank attacks pawns and traps the king.",
    ],
    quiz: {
      question: "Where is a rook strongest?",
      choices: ["Behind its own pawns", "Next to the king", "In the corner all game", "On an open file"],
      correctIndex: 3,
    },
    xpReward: 70,
    fen: "4r1k1/ppp2ppp/8/8/8/8/PPP2PPP/R5K1 w - - 0 1",
    boardCaption: "The e-file has no pawns — seize it with Re1.",
    guide: "rook",
    steps: [
      { type: "intro", guide: "rook", title: "Give your rook a highway", text: "Bramble again. Rooks hate being hemmed in. Find a file with no pawns and slam a rook onto it." },
      { type: "board-demo", fen: "4r1k1/ppp2ppp/8/8/8/8/PPP2PPP/R5K1 w - - 0 1", highlights: ["e8", "e1"], prompt: "Which file has no pawns at all?", caption: "The e-file is wide open — whoever takes it dominates.", guide: "rook" },
      { type: "make-move", fen: "4r1k1/ppp2ppp/8/8/8/8/PPP2PPP/R5K1 w - - 0 1", correctUci: "a1e1", prompt: "Seize the open file — bring your rook to e1.", successText: "Re1! Your rook controls the open file.", failureText: "Move your a1 rook onto the open e-file (e1).", hint: "Rook a1 slides to e1.", guide: "rook" },
      { type: "multiple-choice", prompt: "Where is a rook strongest?", choices: ["On an open file", "Behind its own pawns", "In the corner all game", "Next to the king"], correctIndex: 0, successText: "Open files — a rook's natural home.", guide: "rook" },
    ],
  },
  {
    id: "t2-active-bishops",
    tier: 2,
    order: 5,
    title: "Active Bishops",
    subtitle: "Aim them down long diagonals",
    explanation:
      "Bishops are long-range snipers — but only on open diagonals. A bishop blocked by its own pawns is a 'bad bishop'; one with a clear diagonal pointing at the enemy king is worth its weight in gold. Develop bishops to active, unobstructed squares.",
    keyPoints: [
      "A bishop is only as strong as the diagonal it sees.",
      "Avoid burying a bishop behind its own pawns.",
      "Two bishops on open diagonals (the 'bishop pair') are a real edge.",
    ],
    quiz: {
      question: "What makes a bishop 'bad'?",
      choices: ["It is on the queenside", "It has moved twice", "Its own pawns block its diagonals", "It is light-squared"],
      correctIndex: 2,
    },
    xpReward: 70,
    fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1",
    boardCaption: "Bc4 puts the bishop on a long diagonal aimed at f7.",
    guide: "bishop",
    steps: [
      { type: "intro", guide: "bishop", title: "Find the long diagonal", text: "Bea here. I'm a sniper — but only with a clear line of fire. Place me where my diagonal points deep into your opponent's camp." },
      { type: "board-demo", fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1", highlights: ["f1", "c4", "f7"], prompt: "Where does the f1 bishop have the most scope?", caption: "Bc4 eyes the weak f7 square near the black king.", guide: "bishop" },
      { type: "make-move", fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1", correctUci: "f1c4", prompt: "Develop the bishop to its best diagonal.", successText: "Bc4! Pointed straight at f7.", failureText: "Bring the f1 bishop out to c4.", hint: "Bishop f1 to c4.", guide: "bishop" },
      { type: "multiple-choice", prompt: "What makes a bishop 'bad'?", choices: ["It is on the queenside", "Its own pawns block its diagonals", "It has moved twice", "It is light-squared"], correctIndex: 1, successText: "A blocked diagonal makes a sad bishop.", guide: "bishop" },
    ],
  },
  {
    id: "t2-pawn-structure",
    tier: 2,
    order: 6,
    title: "Healthy Pawns",
    subtitle: "Doubled and isolated weaknesses",
    explanation:
      "Pawns can't move backward, so their weaknesses are permanent. An isolated pawn has no friendly pawn on either neighbouring file and must be defended by pieces. Doubled pawns (two on one file) can't guard each other. Aim for a healthy, connected pawn chain — and target your opponent's weak pawns.",
    keyPoints: [
      "An isolated pawn has no neighbour to defend it.",
      "Doubled pawns can't protect one another.",
      "Connected pawns defend each other and advance safely.",
    ],
    quiz: {
      question: "What is an isolated pawn?",
      choices: ["A pawn on the edge", "A doubled pawn", "Any passed pawn", "A pawn with no friendly pawn on either adjacent file"],
      correctIndex: 3,
    },
    xpReward: 70,
    fen: "4k3/pp3ppp/8/3p4/8/8/PP3PPP/4K3 w - - 0 1",
    boardCaption: "Black's d5 pawn is isolated — no c- or e-pawn can guard it.",
    guide: "queen",
    steps: [
      { type: "intro", guide: "queen", title: "Spot the weakling", text: "Vera here. Pawns never retreat, so a weak one stays weak forever. Learn to spot the lonely, undefendable pawns — yours and theirs." },
      { type: "board-demo", fen: "4k3/pp3ppp/8/3p4/8/8/PP3PPP/4K3 w - - 0 1", highlights: ["c7", "d5", "e7"], prompt: "Look at the d5 pawn's neighbours.", caption: "No black pawn on c or e — d5 is isolated and must be guarded by pieces.", guide: "queen" },
      { type: "tap-piece", fen: "4k3/pp3ppp/8/3p4/8/8/PP3PPP/4K3 w - - 0 1", prompt: "Tap Black's isolated pawn — the one no pawn can defend.", targets: ["d5"], successText: "That's the isolated d5 pawn — a long-term target.", hint: "It's the pawn standing alone in the centre.", guide: "queen" },
      { type: "multiple-choice", prompt: "What is an isolated pawn?", choices: ["A pawn with no friendly pawn on either adjacent file", "A pawn on the edge", "Any passed pawn", "A doubled pawn"], correctIndex: 0, successText: "No neighbours — that's isolation.", guide: "queen" },
    ],
  },
  {
    id: "t2-outposts",
    tier: 2,
    order: 7,
    title: "Knights on Outposts",
    subtitle: "Plant a knight that can't be kicked",
    explanation:
      "An outpost is a square deep in enemy territory, defended by one of your pawns, that no enemy pawn can ever attack. A knight on a central outpost is a monster — it can't be chased away and it forks everything nearby. Hunt for outposts and occupy them.",
    keyPoints: [
      "An outpost is a square a pawn defends and no enemy pawn can hit.",
      "Knights are the best outpost pieces.",
      "A protected knight on e5/d5 dominates the board.",
    ],
    quiz: {
      question: "What is an outpost?",
      choices: ["Any central square", "The corner square", "A square your pawn defends that no enemy pawn can attack", "A square with a rook"],
      correctIndex: 2,
    },
    xpReward: 70,
    fen: "r1bqk2r/ppp2ppp/2n2n2/3p4/3P4/2N2N2/PPP2PPP/R1BQK2R w KQkq - 0 1",
    boardCaption: "Ne5 lands on a protected outpost in the heart of Black's camp.",
    guide: "knight",
    steps: [
      { type: "intro", guide: "knight", title: "My favourite square", text: "Gallop! Give me a square your pawn guards that no enemy pawn can ever attack, and I'll plant myself there forever." },
      { type: "board-demo", fen: "r1bqk2r/ppp2ppp/2n2n2/3p4/3P4/2N2N2/PPP2PPP/R1BQK2R w KQkq - 0 1", highlights: ["d4", "e5"], prompt: "The d4 pawn guards e5 — and no black pawn can hit it.", caption: "e5 is a perfect outpost for a knight.", guide: "knight" },
      { type: "make-move", fen: "r1bqk2r/ppp2ppp/2n2n2/3p4/3P4/2N2N2/PPP2PPP/R1BQK2R w KQkq - 0 1", correctUci: "f3e5", prompt: "Leap your knight onto the e5 outpost.", successText: "Ne5! A protected knight dominating the centre.", failureText: "Jump the f3 knight to the e5 outpost.", hint: "Knight f3 to e5.", guide: "knight" },
      { type: "multiple-choice", prompt: "What is an outpost?", choices: ["Any central square", "A square your pawn defends that no enemy pawn can attack", "The corner square", "A square with a rook"], correctIndex: 1, successText: "Pawn-protected and pawn-proof — an outpost.", guide: "knight" },
    ],
  },
];
