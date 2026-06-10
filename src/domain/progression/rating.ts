/**
 * Puzzle rating — a small, original Elo-style system for Sprint 3.
 *
 * Pure and side-effect free so it can be unit-tested in isolation. The player
 * is treated as one "side" and the puzzle as the opponent: solving a puzzle is
 * a win, failing it is a loss. The standard Elo expectation curve then gives us
 * all of the desired behaviours for free:
 *
 *   - Correct vs a HIGHER-rated puzzle  → large gain.
 *   - Correct vs a LOWER-rated puzzle   → small gain.
 *   - Wrong   vs a LOWER-rated puzzle   → large loss.
 *   - Wrong   vs a HIGHER-rated puzzle  → small loss.
 */

export const DEFAULT_PUZZLE_RATING = 400;
export const PUZZLE_RATING_FLOOR = 100;

/** Development factor. Beginners move faster than seasoned players would. */
const K_FACTOR = 32;

/** Elo expected score for the player against a puzzle of `puzzleRating`. */
export function expectedScore(playerRating: number, puzzleRating: number): number {
  return 1 / (1 + 10 ** ((puzzleRating - playerRating) / 400));
}

/**
 * The player's new rating after attempting a puzzle.
 * `correct` true counts as a win (score 1), false as a loss (score 0).
 * Never drops below {@link PUZZLE_RATING_FLOOR}.
 */
export function nextRating(
  playerRating: number,
  puzzleRating: number,
  correct: boolean,
  k: number = K_FACTOR,
): number {
  const expected = expectedScore(playerRating, puzzleRating);
  const actual = correct ? 1 : 0;
  const raw = playerRating + k * (actual - expected);
  return Math.max(PUZZLE_RATING_FLOOR, Math.round(raw));
}

/** Signed change `nextRating` would apply (positive on a win, negative on a loss). */
export function ratingDelta(
  playerRating: number,
  puzzleRating: number,
  correct: boolean,
  k: number = K_FACTOR,
): number {
  return nextRating(playerRating, puzzleRating, correct, k) - playerRating;
}

export const DEFAULT_PLAY_RATING = 400;

/**
 * Elo update for a finished match. `score` is 1 (win), 0.5 (draw), or 0 (loss).
 * Used by the bot-match play rating.
 */
export function eloUpdate(
  playerRating: number,
  opponentRating: number,
  score: number,
  k = 24,
): number {
  const expected = expectedScore(playerRating, opponentRating);
  return Math.max(PUZZLE_RATING_FLOOR, Math.round(playerRating + k * (score - expected)));
}
