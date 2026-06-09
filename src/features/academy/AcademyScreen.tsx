"use client";

import { useEffect } from "react";
import { useProfileStore, academyProgress, lessonStatus } from "@/state/profileStore";
import { TIER0_LESSONS, TIER0_TITLE } from "@/content/academy/tier0";
import GameCard from "@/components/ui/GameCard";
import XPBar from "@/components/ui/XPBar";
import PathNode, { type NodeStatus } from "@/components/ui/PathNode";

const TOTAL_XP = TIER0_LESSONS.reduce((sum, l) => sum + l.xpReward, 0);

function toNodeStatus(status: "completed" | "available" | "locked"): NodeStatus {
  if (status === "completed") return "completed";
  if (status === "available") return "active";
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

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-muted2">Academy</p>
        <h1 className="font-display text-3xl text-cream">{TIER0_TITLE}</h1>
        <p className="mt-1 text-sm text-muted">Climb the Foundations Path, one node at a time.</p>
      </header>

      {/* Tier header with progress + reward preview */}
      <GameCard variant="accent" glow className="p-4">
        <div className="flex items-center justify-between">
          <span className="font-display text-lg text-cream">Foundations Path</span>
          <span className="rounded-full border border-brass/40 bg-brass/10 px-2.5 py-1 text-[11px] font-semibold text-brass">
            Tier 0
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <XPBar value={prog.pct} />
          <span className="shrink-0 text-xs text-muted">
            {prog.done}/{prog.total}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-muted2">
          <span className="rounded-md border border-line bg-ink2 px-2 py-1">Reward</span>
          <span>{TOTAL_XP} XP · Foundations Badge</span>
        </div>
      </GameCard>

      {/* Progression path */}
      <ul className="relative space-y-3">
        {/* spine connecting the nodes */}
        <div className="pointer-events-none absolute left-[21px] top-6 bottom-6 w-0.5 tab-path-line" />

        {lessons.map((l) => {
          const status = toNodeStatus(lessonStatus(l.order, completed));
          return (
            <PathNode
              key={l.id}
              order={l.order}
              title={l.title}
              subtitle={l.subtitle}
              xpReward={l.xpReward}
              status={status}
              href={`/academy/${l.id}`}
            />
          );
        })}

        {/* Boss Gate */}
        <PathNode
          order="★"
          title="Tier 0 Trial"
          subtitle={allDone ? "Unlocked — coming soon" : "The Foundations boss gate"}
          status={allDone ? "boss-ready" : "boss-locked"}
        />
      </ul>
    </div>
  );
}
