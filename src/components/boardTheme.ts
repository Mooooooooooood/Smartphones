/**
 * Shared chessboard styling. Colours come from CSS variables (resolved inline)
 * so every board re-themes automatically: soft light-blue squares by day,
 * moonlit indigo squares at night. Tokens live in globals.css.
 */
export const BOARD_SQUARE_STYLES = {
  darkSquareStyle: { backgroundColor: "var(--board-dark)" },
  lightSquareStyle: { backgroundColor: "var(--board-light)" },
  darkSquareNotationStyle: { color: "var(--board-coord-on-dark)" },
  lightSquareNotationStyle: { color: "var(--board-coord-on-light)" },
} as const;
