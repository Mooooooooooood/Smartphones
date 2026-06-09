"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useProfileStore, academyProgress, lessonStatus } from "@/state/profileStore";
import { TIER0_LESSONS, TIER0_TITLE } from "@/content/academy/tier0";
import ProgressBar from "@/components/ProgressBar";

function Stars({ n }: { n: number }) {
  return (
    <span className="text-sm leading-none">
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < n ? "text-brass" : "text-line"}>
          ★
        </span>
      ))}
    </span>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export default function AcademyScreen() {
  const completed = useProfileStore((s) => s.completed);

  useEffect(() => {
    void useProfileStore.getState().hydrate();
  }, []);

  const prog = academyProgress(completed);
  const lessons = [...TIER0_LESSONS].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-muted2">Academy</p>
        <h1 className="font-display text-3xl text-cream">{TIER0_TITLE}</h1>
        <p className="mt-1 text-sm text-muted">Master the rules, one step at a time.</p>
        <div className="mt-3 flex items-center gap-3">
          <ProgressBar value={prog.pct} />
          <span className="shrink-0 text-xs text-muted">
            {prog.done}/{prog.total}
          </span>
        </div>
      </header>

      <ul className="space-y-2.5">
        {lessons.map((l) => {
          const status = lessonStatus(l.order, completed);
          const done = status === "completed";
          const locked = status === "locked";
          const stars = completed[l.id]?.stars ?? 0;

          const card = (
            <div
              className={`flex items-center gap-3 rounded-2xl border p-3.5 ${
                locked ? "border-line bg-panel/40 opacity-60" : done ? "border-brass/30 bg-panel" : "border-line bg-panel"
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  done
                    ? "bg-brass text-ink"
                    : locked
                      ? "bg-panel2 text-muted2"
                      : "border border-brass/50 text-brass"
                }`}
              >
                {done ? "✓" : locked ? <LockIcon /> : l.order}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate font-display text-base text-cream">{l.title}</h3>
                  {done ? (
                    <Stars n={stars} />
                  ) : (
                    <span className="shrink-0 text-[11px] font-semibold text-muted2">+{l.xpReward} XP</span>
                  )}
                </div>
                <p className="truncate text-xs text-muted2">
                  {locked ? "Complete the previous lesson to unlock" : l.subtitle}
                </p>
              </div>
            </div>
          );

          return (
            <li key={l.id}>
              {locked ? (
                card
              ) : (
                <Link href={`/academy/${l.id}`} className="block transition-transform active:scale-[0.99]">
                  {card}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
