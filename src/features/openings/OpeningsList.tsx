"use client";

import Link from "next/link";
import { OPENINGS, variationCount } from "@/content/openings";
import { useLearnedOpenings } from "@/lib/openingProgress";
import { useOpeningReviewCards, dueOpeningIds } from "@/lib/openingReview";
import PixelTopBar from "@/components/pixel/PixelTopBar";
import PixelPanel from "@/components/pixel/PixelPanel";
import ChessBuddy from "@/components/characters/ChessBuddy";

export default function OpeningsList() {
  const learned = useLearnedOpenings();
  const cards = useOpeningReviewCards();
  const doneCount = OPENINGS.filter((o) => learned[o.id]).length;
  const due = new Set(dueOpeningIds(learned, cards));

  return (
    <div className="space-y-2.5">
      <PixelTopBar />

      <div className="flex items-end justify-between">
        <div>
          <p className="px-label text-[0.5rem] text-brass">Opening Trainer</p>
          <h1 className="px-title text-[1.3rem] text-cream">Repertoires</h1>
        </div>
        <span className="px-inset px-2 py-1 text-[0.56rem] text-cream">{doneCount}/{OPENINGS.length} learned</span>
      </div>

      <p className="px-1 text-[0.58rem] text-muted2">Learn an opening move by move — the trainer plays the standard replies, branching when the opponent has more than one. Come back to review and keep them sharp!</p>

      {due.size > 0 ? (
        <p className="px-inset px-2.5 py-1.5 text-[0.54rem] text-brass">↻ {due.size} opening{due.size === 1 ? "" : "s"} due for review — drill {due.size === 1 ? "it" : "them"} to keep your edge.</p>
      ) : null}

      <div className="space-y-2">
        {OPENINGS.map((o) => {
          const isLearned = Boolean(learned[o.id]);
          const isDue = due.has(o.id);
          const lines = variationCount(o);
          return (
            <Link key={o.id} href={`/openings/${o.id}`} className="block active:translate-y-0.5">
              <PixelPanel hue={o.side === "white" ? "gold" : "purple"} className="flex items-center gap-2.5 px-2.5 py-2">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] border-2 border-[var(--px-edge)] bg-[var(--color-ink)]">
                  <ChessBuddy piece={o.guide} size={36} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="px-label text-[0.62rem] text-cream">{o.name}</span>
                    <span className="px-label text-[0.42rem] text-muted2">{o.eco}</span>
                    {lines > 1 ? <span className="px-label text-[0.42rem] text-muted2">· {lines} lines</span> : null}
                  </div>
                  <p className="truncate text-[0.54rem] text-muted2">{o.summary}</p>
                </div>
                {isDue ? (
                  <span className="px-label shrink-0 rounded-[5px] border-2 border-[var(--px-edge)] bg-brass px-2 py-1 text-[0.5rem] text-[color:var(--color-on-accent)]">↻ REVIEW</span>
                ) : isLearned ? (
                  <span className="px-label shrink-0 rounded-[5px] border-2 border-[var(--px-edge)] bg-good px-2 py-1 text-[0.5rem] text-[color:var(--color-on-good)]">✓ Learned</span>
                ) : (
                  <span className="px-label shrink-0 rounded-[5px] border-2 border-[var(--px-edge)] px-2 py-1 text-[0.5rem]" style={{ background: o.side === "white" ? "var(--color-brass)" : "var(--color-lav)", color: o.side === "white" ? "var(--color-on-accent)" : "var(--color-on-purple)" }}>LEARN ›</span>
                )}
              </PixelPanel>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
