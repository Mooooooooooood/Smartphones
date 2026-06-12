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
    line: "You've climbed far. Now face me — no mercy.",
    surface: "bg-surf-peach",
    reactions: {
      win: "Impossible… you've truly mastered the board.",
      loss: "As expected. Come back when you're stronger.",
      draw: "A worthy duel. We are not done.",
    },
    rival: true,
  },
];

export function opponentById(id: string | null | undefined): Opponent | undefined {
  return OPPONENTS.find((o) => o.id === id);
}
