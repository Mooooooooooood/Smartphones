"use client";

import { useEffect } from "react";
import { useProfileStore, academyProgress, lessonStatus } from "@/state/profileStore";
import { TIER0_LESSONS } from "@/content/academy/tier0";
import GameCard from "@/components/ui/GameCard";
import XPBar from "@/components/ui/XPBar";
import AcademyPath, { type PathStop, type StopStatus } from "@/components/ui/AcademyPath";

const TOTAL_XP = TIER0_LESSONS.reduce((sum, l) => sum + l.xpReward, 0);
const MID = 4; // reward chest appears after the first four lessons

function toStatus(s: "completed" | "available" | "locked"): StopStatus {
  if (s === "completed") return "completed";
  if (s === "available") return "active";
  return "locked";
}

export default function AcademyScreen() {
  const completed = useProfileStore((s) => s.completed);

  useEffect(() => {
    void useProfileStore.getState().hydrate();
  }, []);

  const prog = academyProgress(completed);
  const lessons = [...TIER0_LESSONS].sort((a, b) => a.order - b.order);
  const allDone = prog.done === prog.total;

  // Build the winding path: lessons, a mid reward chest, then the Boss Gate.
  const stops: PathStop[] = [];
  lessons.forEach((l) => {
    stops.push({
      kind: "lesson",
      key: l.id,
      order: l.order,
      title: l.title,
      xpReward: l.xpReward,
      status: toStatus(lessonStatus(l.order, completed)),
      href: `/academy/${l.id}`,
    });
    if (l.order === MID) {
      stops.push({
        kind: "chest",
        key: "reward-mid",
        title: "Path Reward",
        caption: "Reward",
        status: prog.done >= MID ? "ready" : "locked",
      });
    }
  });
  stops.push({
    kind: "boss",
    key: "boss-gate",
    title: "Tier 0 Trial",
    caption: allDone ? "Unlocked" : "Boss Gate",
    status: allDone ? "ready" : "locked",
  });

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-muted2">Academy</p>
        <h1 className="font-display text-3xl text-cream">The Foundations Path</h1>
      </header>

      {/* Tier header band */}
      <GameCard variant="accent" glow className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-brass">Tier 0 · Unit 1</p>
            <h2 className="font-display text-lg text-cream">Foundations</h2>
          </div>
          <span className="rounded-full border border-brass/40 bg-brass/10 px-2.5 py-1 text-[11px] font-semibold text-brass">
            {prog.done}/{prog.total}
          </span>
        </div>
        <div className="mt-3">
          <XPBar value={prog.pct} />
        </div>
        <p className="mt-2 text-[11px] text-muted2">Reward · {TOTAL_XP} XP + Foundations Badge</p>
      </GameCard>

      {/* Winding progression map */}
      <AcademyPath stops={stops} />
    </div>
  );
}
