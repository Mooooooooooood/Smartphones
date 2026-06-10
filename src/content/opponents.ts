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
  },
];

export function opponentById(id: string | null | undefined): Opponent | undefined {
  return OPPONENTS.find((o) => o.id === id);
}
