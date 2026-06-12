import type { CSSProperties } from "react";

/**
 * Shared chessboard styling. Colours come from CSS variables (resolved inline)
 * so every board re-themes automatically: light pixel squares by day, moonlit
 * indigo squares at night. Tokens live in globals.css.
 */
export const BOARD_SQUARE_STYLES = {
  darkSquareStyle: { backgroundColor: "var(--board-dark)" },
  lightSquareStyle: { backgroundColor: "var(--board-light)" },
  darkSquareNotationStyle: { color: "var(--board-coord-on-dark)", fontFamily: "var(--font-display)", fontSize: "0.5rem" },
  lightSquareNotationStyle: { color: "var(--board-coord-on-light)", fontFamily: "var(--font-display)", fontSize: "0.5rem" },
} as const;

/**
 * Pixel-art square highlights shared by every board (move targets are square
 * "blips", captures get a chunky ring, etc.) so all boards feel cohesive.
 */
export const BOARD_HL: Record<string, CSSProperties> = {
  // centred square "move blip" instead of a soft circle
  moveDot: {
    backgroundImage: "linear-gradient(#3b82f6, #3b82f6)",
    backgroundSize: "32% 32%",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  captureRing: { boxShadow: "inset 0 0 0 5px rgba(244,63,94,0.7)" },
  selected: { boxShadow: "inset 0 0 0 4px #f7bd3f" },
  lastMove: { backgroundImage: "linear-gradient(rgba(247,189,63,0.45), rgba(247,189,63,0.45))" },
  check: { boxShadow: "inset 0 0 0 5px rgba(244,63,94,0.85)" },
  correct: { backgroundImage: "linear-gradient(rgba(69,211,108,0.55), rgba(69,211,108,0.55))" },
  wrong: { backgroundImage: "linear-gradient(rgba(255,84,104,0.5), rgba(255,84,104,0.5))" },
  hint: { boxShadow: "inset 0 0 0 4px rgba(96,165,250,0.9)" },
  demo: { boxShadow: "inset 0 0 0 5px rgba(96,165,250,0.9)" },
};
