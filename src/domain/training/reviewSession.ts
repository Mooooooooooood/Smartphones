import { useProfileStore } from "@/state/profileStore";
import { loadReviewCard, loadReviewCards, saveReviewCard } from "@/data/reviewRepository";
import { dueReviewIds, missedPuzzleIds, newCard, review, type ReviewCard } from "@/domain/training/srs";

/** Count of puzzles attempted but never solved — drives the Home badge. */
export function missedCount(): number {
  const s = useProfileStore.getState();
  return missedPuzzleIds(s.attemptedPuzzleIds, s.solvedPuzzleIds).length;
}

/** Build today's Smart Review queue (missed puzzles whose card is due). */
export async function loadDueReviewIds(now: number = Date.now()): Promise<string[]> {
  const s = useProfileStore.getState();
  const missed = missedPuzzleIds(s.attemptedPuzzleIds, s.solvedPuzzleIds);
  const cardList = await loadReviewCards();
  const cards: Record<string, ReviewCard> = {};
  for (const c of cardList) cards[c.id] = c;
  return dueReviewIds(missed, cards, now);
}

/**
 * Record a review outcome for the scheduler. A correct answer graduates the
 * puzzle (it becomes "solved" via recordPuzzleResult, leaving the missed set),
 * so we mainly schedule misses to resurface later — preventing same-session loops.
 */
export async function recordReviewResult(id: string, correct: boolean, now: number = Date.now()): Promise<void> {
  const existing = (await loadReviewCard(id)) ?? newCard(id, now);
  await saveReviewCard(review(existing, correct, now));
}
