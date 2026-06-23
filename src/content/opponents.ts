import type { BotPersonality } from "@/domain/chess/bot";
import type { BuddyPiece } from "@/components/characters/ChessBuddy";

export interface Opponent {
  id: string;
  name: string;
  piece: BuddyPiece;
  level: string;
  rating: number;
  xpReward: number;
  personality: BotPersonality;
  /** Engine search depth (1–4). */
  depth: number;
  /** Engine weakening, 0 (near-random) → 1 (always best). */
  skill: number;
  line: string;
  surface: string; // soft card surface class
  /** Short post-match reactions, keyed by the USER's result. */
  reactions: { win: string; loss: string; draw: string };
  /** Suggested starting opponent for beginners. */
  recommended?: boolean;
  /** Elite red rival — rendered with the intense rival palette. */
  rival?: boolean;
}

/** Three friendly cartoon bot opponents. All play legal chess.js moves only. */
export const OPPONENTS: Opponent[] = [
  {
    id: "pip",
    name: "Pip the Pawn",
    piece: "pawn",
    level: "Newcomer",
    rating: 300,
    xpReward: 18,
    personality: "random",
    depth: 1,
    skill: 0.05,
    line: "Yay, my first match! Let's just have fun.",
    surface: "bg-surf-blue",
    reactions: {
      win: "Great job! You found the checkmate! 🎉",
      loss: "Nice try — let's practice again!",
      draw: "So close! That was a fun one!",
    },
    recommended: true,
  },
  {
    id: "bramble",
    name: "Bramble the Rook",
    piece: "rook",
    level: "Beginner",
    rating: 400,
    xpReward: 24,
    personality: "cautious",
    depth: 1,
    skill: 0.25,
    line: "Slow and steady. I like a tidy board.",
    surface: "bg-surf-peach",
    reactions: {
      win: "Well played — solid, steady technique.",
      loss: "Good effort. Review it and go again.",
      draw: "A balanced game. Nicely held.",
    },
  },
  {
    id: "gallop",
    name: "Gallop the Knight",
    piece: "knight",
    level: "Tactics Learner",
    rating: 600,
    xpReward: 32,
    personality: "tactical",
    depth: 2,
    skill: 0.5,
    line: "I love a cheeky fork — watch out!",
    surface: "bg-surf-mint",
    reactions: {
      win: "Whoa, you out-tricked me! 😄",
      loss: "Gotcha! Keep an eye on those forks 😉",
      draw: "A tricky draw — I'll get you next time!",
    },
  },
  {
    id: "vex",
    name: "Vex the Rival",
    piece: "queen",
    level: "Elite Challenger",
    rating: 900,
    xpReward: 50,
    personality: "tactical",
    depth: 2,
    skill: 0.8,
    line: "You've climbed far. Now face me — no mercy.",
    surface: "bg-surf-peach",
    reactions: {
      win: "Impossible… you've truly mastered the board.",
      loss: "As expected. Come back when you're stronger.",
      draw: "A worthy duel. We are not done.",
    },
    rival: true,
  },
  {
    id: "sable",
    name: "Sable the Bishop",
    piece: "bishop",
    level: "Club Player",
    rating: 1200,
    xpReward: 70,
    personality: "tactical",
    depth: 3,
    skill: 0.92,
    line: "Diagonals are my domain. Show me your plan.",
    surface: "bg-surf-lav",
    reactions: {
      win: "Elegant. You saw deeper than I did.",
      loss: "Calculated. Study the lines and return.",
      draw: "A poised, balanced fight. Respect.",
    },
  },
  {
    id: "onyx",
    name: "Onyx the King",
    piece: "king",
    level: "Master",
    rating: 1600,
    xpReward: 100,
    personality: "tactical",
    depth: 3,
    skill: 1,
    line: "Few reach my board. Fewer leave with a win.",
    surface: "bg-surf-blue",
    reactions: {
      win: "Astonishing. You have truly arrived.",
      loss: "The board does not lie. Train, and try again.",
      draw: "You held the master to a draw. Remarkable.",
    },
    rival: true,
  },
];

export function opponentById(id: string | null | undefined): Opponent | undefined {
  return OPPONENTS.find((o) => o.id === id);
}
