/**
 * Shared bright-cartoon board styling, so every board uses the same soft
 * light-blue squares. Colours live here rather than scattered per component.
 */
export const BOARD_SQUARE_STYLES = {
  darkSquareStyle: { backgroundColor: "#c4d8f0" },
  lightSquareStyle: { backgroundColor: "#eef4fc" },
  darkSquareNotationStyle: { color: "rgba(30,41,59,0.55)" },
  lightSquareNotationStyle: { color: "rgba(30,41,59,0.40)" },
} as const;
