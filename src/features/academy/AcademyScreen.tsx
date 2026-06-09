"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useProfileStore, academyStateFrom } from "@/state/profileStore";
import { lessonsForTier, tierTotalXp, TIER0_BOSS } from "@/content/academy";
import { TIER0_TITLE } from "@/content/academy/tier0";
import { TIER1_TITLE } from "@/content/academy/tier1";
import {
  lessonStatus,
  bossStatus,
  tierProgress,
  isTierUnlocked,
  nextRecommended,
  type LessonStatus,
} from "@/domain/academy/progression";
import GameCard from "@/components/ui/GameCard";
import XPBar from "@/components/ui/XPBar";
import AcademyPath, { type PathStop, type StopStatus } from "@/components/ui/AcademyPath";

const MID = 4; // reward chest after the first four Tier 0 lessons

function toStop(s: LessonStatus): StopStatus {
  if (s === "completed") return "completed";
  if (s === "available") return "active";
  return "locked";
}

function TierBand({
  eyebrow,
  title,
  done,
  total,
  pct,
  rewardXp,
  locked = false,
}: {
  eyebrow: string;
  title: string;
  done: number;
  total: number;
  pct: number;
  rewardXp: number;
  locked?: boolean;
}) {
  return (
    <GameCard variant={locked ? "default" : "accent"} glow={!locked} className={`p-4 ${locked ? "opacity-80" : ""}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-brass">{eyebrow}</p>
          <h2 className="font-display text-lg text-cream">{title}</h2>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
            locked ? "border-line bg-ink2 text-muted2" : "border-brass/40 bg-brass/10 text-brass"
          }`}
        >
          {locked ? "Locked" : `${done}/${total}`}
        </span>
      </div>
      {!locked ? (
        <div className="mt-3">
          <XPBar value={pct} />
        </div>
      ) : null}
      <p className="mt-2 text-[11px] text-muted2">
        {locked ? "Pass the Tier 0 Trial to unlock" : `Reward · ${rewardXp} XP`}
      </p>
    </GameCard>
  );
}

export default function AcademyScreen() {
  const completed = useProfileStore((s) => s.completed);
  const bossClearedMap = useProfileStore((s) => s.bossCleared);

  useEffect(() => {
    void useProfileStore.getState().hydrate();
  }, []);

  const state = academyStateFrom(completed, bossClearedMap);
  const step = nextRecommended(state);

  const t0 = tierProgress(0, state);
  const t1 = tierProgress(1, state);
  const tier1Unlocked = isTierUnlocked(1, state);
  const bStatus = bossStatus(TIER0_BOSS.id, state);

  // Tier 0 stops: lessons, mid chest, boss gate.
  const tier0Stops: PathStop[] = [];
  lessonsForTier(0).forEach((l) => {
    tier0Stops.push({
      kind: "lesson",
      key: l.id,
      order: l.order,
      title: l.title,
      xpReward: l.xpReward,
      status: toStop(lessonStatus(l, state)),
      href: `/academy/${l.id}`,
    });
    if (l.order === MID) {
      tier0Stops.push({
        kind: "chest",
        key: "t0-reward",
        title: "Path Reward",
        caption: "Reward",
        status: t0.done >= MID ? "ready" : "locked",
      });
    }
  });
  tier0Stops.push({
    kind: "boss",
    key: "boss-tier-0",
    title: TIER0_BOSS.title,
    caption: bStatus === "completed" ? "Cleared" : bStatus === "ready" ? "Trial" : "Boss Gate",
    status: bStatus,
    href: bStatus !== "locked" ? `/academy/boss/${TIER0_BOSS.id}` : undefined,
  });

  // Tier 1 stops.
  const tier1Stops: PathStop[] = lessonsForTier(1).map((l) => ({
    kind: "lesson",
    key: l.id,
    order: l.order,
    title: l.title,
    xpReward: l.xpReward,
    status: toStop(lessonStatus(l, state)),
    href: `/academy/${l.id}`,
  }));

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-muted2">Academy</p>
        <h1 className="font-display text-3xl text-cream">Your Learning Map</h1>
      </header>

      {/* Next-step banner */}
      <Link href={step.href} className="block transition-transform active:scale-[0.99]">
        <GameCard variant="accent" glow className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-brass">Next step</p>
            <h2 className="truncate font-display text-base text-cream">{step.title}</h2>
          </div>
          <span className="shrink-0 rounded-full border border-brass/50 bg-brass/15 px-3 py-1.5 text-xs font-bold text-brass">
            {step.cta} ›
          </span>
        </GameCard>
      </Link>

      {/* Tier 0 */}
      <TierBand
        eyebrow="Tier 0 · Unit 1"
        title={TIER0_TITLE.replace("Tier 0 · ", "")}
        done={t0.done}
        total={t0.total}
        pct={t0.pct}
        rewardXp={tierTotalXp(0)}
      />
      <AcademyPath stops={tier0Stops} />

      {/* Tier 1 */}
      <TierBand
        eyebrow="Tier 1"
        title={TIER1_TITLE.replace("Tier 1 · ", "")}
        done={t1.done}
        total={t1.total}
        pct={t1.pct}
        rewardXp={tierTotalXp(1)}
        locked={!tier1Unlocked}
      />
      <AcademyPath stops={tier1Stops} />
    </div>
  );
}
