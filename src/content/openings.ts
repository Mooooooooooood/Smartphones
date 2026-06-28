import type { BuddyPiece } from "@/components/characters/ChessBuddy";

/**
 * Opening repertoires for the Opening Trainer. Each opening is authored as a set
 * of variation `lines` in SAN (canonical, so the trainer derives moves via
 * chess.js — no hand-written UCI to get wrong). The learner plays one colour;
 * the other side's book replies auto-play, and where the opponent has more than
 * one sound try, the line BRANCHES so the learner drills every reply over time.
 *
 * Lines share a common prefix and are merged into a move TREE at load. A test
 * re-verifies every path is legal and that the learner's moves are not blunders.
 */
export interface OpeningMove {
  san: string;
  /** Shown when this move is reached (teaching note, required on learner moves). */
  note?: string;
}

/** A node in the merged move tree: a move plus the replies that can follow it. */
export interface OpeningNode extends OpeningMove {
  replies: OpeningNode[];
}

interface OpeningSpec {
  id: string;
  name: string;
  /** The colour the learner plays. */
  side: "white" | "black";
  eco: string;
  summary: string;
  /** The big idea, shown on the intro. */
  idea: string;
  guide: BuddyPiece;
  /** Authored variations, each a full line from the start (alternating colours). */
  lines: OpeningMove[][];
}

export interface Opening extends OpeningSpec {
  /** Variation lines merged into a tree (root = candidate first moves). */
  tree: OpeningNode[];
}

/** Merge a set of SAN lines that share prefixes into one move tree. */
export function buildOpeningTree(lines: OpeningMove[][]): OpeningNode[] {
  const roots: OpeningNode[] = [];
  for (const line of lines) {
    let level = roots;
    for (const mv of line) {
      let node = level.find((n) => n.san === mv.san);
      if (!node) {
        node = { san: mv.san, note: mv.note, replies: [] };
        level.push(node);
      } else if (!node.note && mv.note) {
        node.note = mv.note;
      }
      level = node.replies;
    }
  }
  return roots;
}

const SPECS: OpeningSpec[] = [
  {
    id: "italian",
    name: "Italian Game",
    side: "white",
    eco: "C50",
    summary: "Classic 1.e4 opening — quick development and an eye on f7.",
    idea: "Develop the bishop to c4 aiming at f7, support the centre with c3/d3, then castle. Fast, principled, and great for beginners.",
    guide: "knight",
    lines: [
      // Giuoco Piano — Black plays 3...Bc5.
      [
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
      // Two Knights — Black plays 3...Nf6 instead; keep it quiet with d3.
      [
        { san: "e4" },
        { san: "e5" },
        { san: "Nf3" },
        { san: "Nc6" },
        { san: "Bc4" },
        { san: "Nf6" },
        { san: "d3", note: "Quiet and solid — sidestep the sharp Fried Liver and keep an easy game." },
        { san: "Bc5" },
        { san: "O-O", note: "Castle to safety; you have a comfortable Italian setup." },
        { san: "O-O" },
      ],
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
    lines: [
      // Main: Black develops with ...Nf6 and ...e6.
      [
        { san: "d4", note: "Stake out the centre with the queen's pawn." },
        { san: "d5" },
        { san: "Bf4", note: "Develop the bishop OUTSIDE the pawn chain — the heart of the London." },
        { san: "Nf6" },
        { san: "e3", note: "Open the other bishop and make a solid pawn triangle." },
        { san: "e6" },
        { san: "Nf3", note: "Develop the knight toward the centre." },
        { san: "Bd6" },
        { san: "Bg3", note: "Keep your strong bishop by sidestepping the trade." },
        { san: "O-O" },
        { san: "Bd3", note: "Aim the light bishop at Black's kingside." },
        { san: "Nc6" },
      ],
      // Black hits the centre early with ...c5.
      [
        { san: "d4" },
        { san: "d5" },
        { san: "Bf4" },
        { san: "c5" },
        { san: "e3", note: "Stay solid — support d4 before Black pressures it." },
        { san: "Nc6" },
        { san: "c3", note: "Prop up d4 so your centre holds firm." },
        { san: "Nf6" },
        { san: "Nf3", note: "Develop and defend d4 once more." },
        { san: "e6" },
      ],
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
    lines: [
      // Main: 2.exd5 Qxd5.
      [
        { san: "e4" },
        { san: "d5", note: "Hit the e4 pawn right away and fight for the centre." },
        { san: "exd5" },
        { san: "Qxd5", note: "Recapture with the queen — active, but watch for Nc3." },
        { san: "Nc3" },
        { san: "Qa5", note: "Retreat to a safe, active square out of the knight's reach." },
        { san: "d4" },
        { san: "Nf6", note: "Develop and prepare to contest the centre." },
        { san: "Nf3" },
        { san: "c6", note: "Give the queen a retreat and prepare ...Bf5." },
        { san: "Bc4" },
        { san: "Bf5", note: "Develop the bishop actively before locking it in with ...e6." },
      ],
      // White declines with 2.Nc3 — take the centre pawn.
      [
        { san: "e4" },
        { san: "d5" },
        { san: "Nc3" },
        { san: "dxe4", note: "Take the centre pawn — after the recapture you develop with tempo." },
        { san: "Nxe4" },
        { san: "Bf5", note: "Hit the knight and develop your bishop outside the pawn chain." },
        { san: "Ng3" },
        { san: "Bg6", note: "Keep the bishop on its safe, strong diagonal." },
      ],
    ],
  },
  {
    id: "ruy-lopez",
    name: "Ruy Lopez",
    side: "white",
    eco: "C70",
    summary: "The Spanish — pressure Black's knight and the e5 pawn behind it.",
    idea: "Pin the c6-knight with Bb5, retreat to a4 when challenged, castle, and build with Re1 and Bb3. A timeless, strategic opening.",
    guide: "bishop",
    lines: [
      [
        { san: "e4", note: "Open the king's pawn and fight for the centre." },
        { san: "e5" },
        { san: "Nf3", note: "Develop and attack e5 at once." },
        { san: "Nc6" },
        { san: "Bb5", note: "The Spanish bishop — pressure the knight that defends e5." },
        { san: "a6" },
        { san: "Ba4", note: "Keep the pin alive by retreating along the diagonal." },
        { san: "Nf6" },
        { san: "O-O", note: "Castle into safety before opening the centre." },
        { san: "Be7" },
        { san: "Re1", note: "Back up e4 and prepare to meet ...b5 and ...d6." },
        { san: "b5" },
        { san: "Bb3", note: "Reroute the bishop to its strong a2–g8 diagonal, eyeing f7." },
        { san: "d6" },
      ],
    ],
  },
  {
    id: "queens-gambit",
    name: "Queen's Gambit",
    side: "white",
    eco: "D06",
    summary: "Offer the c-pawn to pull Black's centre aside and seize space.",
    idea: "Play c4 against d5, develop Nc3 and Bg5 to pressure d5, then e3 and Nf3 for a rock-solid, space-grabbing setup.",
    guide: "queen",
    lines: [
      // Queen's Gambit Declined.
      [
        { san: "d4", note: "Claim the centre with the queen's pawn." },
        { san: "d5" },
        { san: "c4", note: "The Queen's Gambit — pressure d5 and open lines." },
        { san: "e6" },
        { san: "Nc3", note: "Develop and add a second attacker to d5." },
        { san: "Nf6" },
        { san: "Bg5", note: "Pin Black's knight to pile pressure on d5." },
        { san: "Be7" },
        { san: "e3", note: "Open your bishop and keep a rock-solid centre." },
        { san: "O-O" },
        { san: "Nf3", note: "Develop toward the centre and prepare to castle." },
      ],
      // Queen's Gambit Accepted — regain the pawn with the bishop.
      [
        { san: "d4" },
        { san: "d5" },
        { san: "c4" },
        { san: "dxc4" },
        { san: "e3", note: "Prepare to win the gambit pawn back with the bishop." },
        { san: "Nf6" },
        { san: "Bxc4", note: "Recapture the pawn — you have a strong centre and easy play." },
        { san: "e6" },
        { san: "Nf3", note: "Develop the knight and head for short castling." },
      ],
    ],
  },
  {
    id: "caro-kann",
    name: "Caro-Kann Defense",
    side: "black",
    eco: "B12",
    summary: "A rock-solid answer to 1.e4 with a healthy pawn structure.",
    idea: "Support ...d5 with ...c6 so your centre never crumbles. Get the light bishop OUTSIDE the chain before ...e6.",
    guide: "rook",
    lines: [
      // Classical: 3.Nc3 dxe4.
      [
        { san: "e4" },
        { san: "c6", note: "Prepare ...d5 with a rock-solid pawn chain." },
        { san: "d4" },
        { san: "d5", note: "Challenge the centre — your structure stays sound." },
        { san: "Nc3" },
        { san: "dxe4", note: "Trade in the centre; the knight must recapture." },
        { san: "Nxe4" },
        { san: "Bf5", note: "Develop the bishop OUTSIDE the pawn chain before ...e6." },
        { san: "Ng3" },
        { san: "Bg6", note: "Tuck the bishop onto its safe, strong diagonal." },
      ],
      // Advance Variation: 3.e5 — free the bishop first.
      [
        { san: "e4" },
        { san: "c6" },
        { san: "d4" },
        { san: "d5" },
        { san: "e5" },
        { san: "Bf5", note: "Get the bishop out before ...e6 traps it — the whole point of the Caro." },
        { san: "Nf3" },
        { san: "e6", note: "Build the chain and prepare to challenge with ...c5." },
      ],
    ],
  },
];

export const OPENINGS: Opening[] = SPECS.map((s) => ({ ...s, tree: buildOpeningTree(s.lines) }));

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

/** The candidate moves at a given node path (root when the path is empty). */
export function candidatesAt(opening: Opening, path: OpeningNode[]): OpeningNode[] {
  return path.length === 0 ? opening.tree : path[path.length - 1].replies;
}

/** Every root-to-leaf variation as a list of moves (used by tests + rep counts). */
export function enumeratePaths(tree: OpeningNode[]): OpeningMove[][] {
  const paths: OpeningMove[][] = [];
  const walk = (node: OpeningNode, prefix: OpeningMove[]) => {
    const here = [...prefix, { san: node.san, note: node.note }];
    if (node.replies.length === 0) paths.push(here);
    else for (const r of node.replies) walk(r, here);
  };
  for (const root of tree) walk(root, []);
  return paths;
}

/** How many distinct variations an opening contains (≥1). */
export function variationCount(opening: Opening): number {
  return enumeratePaths(opening.tree).length;
}
