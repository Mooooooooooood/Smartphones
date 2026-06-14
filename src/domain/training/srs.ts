/**
 * Lightweight Leitner spaced-repetition for the Smart Review queue. Pure +
 * testable. A "missed" puzzle (attempted but never solved) enters review; each
 * correct review promotes it to a higher box (longer interval), each miss resets
 * it to box 0. Items are due when `dueAt <= now`.
 */
export interface ReviewCard {
  id: string;
  box: number;
  dueAt: number;
}

const DAY_MS = 86_400_000;
/** Days until an item in each box resurfaces. A fresh card surfaces immediately
 *  (see newCard); after a review the box interval applies. */
export const BOX_DAYS = [1, 2, 4, 8, 16];
export const MAX_BOX = BOX_DAYS.length - 1;

export function newCard(id: string, now: number = Date.now()): ReviewCard {
  return { id, box: 0, dueAt: now };
}

/** Apply a review result: promote on correct, reset on miss; recompute due date. */
export function review(card: ReviewCard, correct: boolean, now: number = Date.now()): ReviewCard {
  const box = correct ? Math.min(card.box + 1, MAX_BOX) : 0;
  return { id: card.id, box, dueAt: now + BOX_DAYS[box] * DAY_MS };
}

export function isDue(card: ReviewCard, now: number = Date.now()): boolean {
  return card.dueAt <= now;
}

/** Puzzles attempted but never solved — the raw "got it wrong" set. */
export function missedPuzzleIds(
  attempted: Record<string, unknown>,
  solved: Record<string, unknown>,
): string[] {
  return Object.keys(attempted).filter((id) => !solved[id]);
}

/**
 * The review queue: missed puzzles whose card is due (or has no card yet, so it
 * surfaces immediately). Sorted soonest-due first.
 */
export function dueReviewIds(
  missed: string[],
  cards: Record<string, ReviewCard>,
  now: number = Date.now(),
): string[] {
  return missed
    .filter((id) => {
      const c = cards[id];
      return !c || isDue(c, now);
    })
    .sort((a, b) => (cards[a]?.dueAt ?? 0) - (cards[b]?.dueAt ?? 0));
}
