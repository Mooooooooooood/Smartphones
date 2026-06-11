"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfileStore, academyStateFrom } from "@/state/profileStore";
import { lessonsForTier, TIER0_BOSS } from "@/content/academy";
import {
  lessonStatus,
  bossStatus,
  tierProgress,
  isTierUnlocked,
  nextRecommended,
} from "@/domain/academy/progression";
import PixelTopBar from "@/components/pixel/PixelTopBar";
import PixelPanel from "@/components/pixel/PixelPanel";
import PixelMapNode, { type MapNodeStatus } from "@/components/pixel/PixelMapNode";
import PixelChest from "@/components/pixel/PixelChest";
import { StarIcon } from "@/components/pixel/PixelIcon";
import RewardModal from "@/components/ui/RewardModal";

const MID_REWARD_ID = "tier0-mid";
const MID_REWARD_XP = 40;

/* Node anchor points along the winding path (left %, bottom %), node 1 first. */
const ANCHORS = [
  { l: 50, b: 4 },
  { l: 27, b: 15 },
  { l: 70, b: 24 },
  { l: 31, b: 35 },
  { l: 68, b: 45 },
  { l: 35, b: 55 },
  { l: 64, b: 64 },
  { l: 47, b: 73 },
];

function PixelTree({ x, b, s = 22 }: { x: number; b: number; s?: number }) {
  return (
    <svg className="px-crisp absolute" style={{ left: `${x}%`, bottom: `${b}%`, width: s, height: s }} viewBox="0 0 10 10" shapeRendering="crispEdges" aria-hidden>
      <rect x="4" y="7" width="2" height="3" fill="#6e431d" />
      <rect x="3" y="1" width="4" height="2" fill="#3f8a4a" />
      <rect x="2" y="3" width="6" height="2" fill="#347a40" />
      <rect x="1" y="5" width="8" height="2" fill="#2c6837" />
      <rect x="3" y="2" width="2" height="1" fill="#5cb368" />
    </svg>
  );
}

export default function AcademyScreen() {
  const completed = useProfileStore((s) => s.completed);
  const bossClearedMap = useProfileStore((s) => s.bossCleared);
  const claimedRewards = useProfileStore((s) => s.claimedRewards);
  const claimReward = useProfileStore((s) => s.claimReward);
  const [modal, setModal] = useState<{ open: boolean; xp: number }>({ open: false, xp: 0 });

  useEffect(() => {
    void useProfileStore.getState().hydrate();
  }, []);

  const state = academyStateFrom(completed, bossClearedMap);
  const step = nextRecommended(state);
  const tier1Open = isTierUnlocked(1, state);
  const bossDone = Boolean(bossClearedMap["tier-0"]);
  const activeTier = tier1Open && bossDone ? 1 : 0;

  const lessons = lessonsForTier(activeTier).slice(0, ANCHORS.length);
  const prog = tierProgress(activeTier, state);
  const bStatus = bossStatus(TIER0_BOSS.id, state);

  const starsEarned = lessons.reduce((sum, l) => sum + (completed[l.id]?.stars ?? 0), 0);
  const starsTotal = lessons.length * 3;

  const midClaimed = Boolean(claimedRewards[MID_REWARD_ID]);
  const midReady = prog.done >= 4 && !midClaimed;

  async function claimMidChest() {
    const got = await claimReward(MID_REWARD_ID, MID_REWARD_XP);
    if (got > 0) setModal({ open: true, xp: got });
  }

  const nodes = lessons.map((lesson, i) => {
    const st = lessonStatus(lesson, state);
    const status: MapNodeStatus = st === "completed" ? "completed" : st === "available" ? "current" : "locked";
    return { lesson, status, stars: completed[lesson.id]?.stars ?? 0, x: ANCHORS[i].l, y: ANCHORS[i].b };
  });

  // Dotted path connecting anchors (SVG y is top-down).
  const pts = ANCHORS.slice(0, lessons.length).map((a) => `${a.l} ${100 - a.b}`);
  const pathD = `M ${pts.join(" L ")}`;

  const tierLabel = activeTier === 0 ? "Tier 0" : "Tier 1";
  const tierName = activeTier === 0 ? "Foundations" : "First Tactics";

  return (
    <div className="space-y-2">
      <PixelTopBar star />

      {/* Title bar */}
      <PixelPanel hue="gold" className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="text-brass" aria-hidden>🌿</span>
          <div>
            <h1 className="px-title text-[1.15rem] leading-none">Academy</h1>
            <p className="px-label mt-0.5 text-[0.42rem] text-muted2">Learn · Practice · Master</p>
          </div>
        </div>
        <div className="px-inset px-2 py-1 text-center">
          <div className="px-label text-[0.5rem] text-brass">{tierLabel}</div>
          <div className="px-label text-[0.4rem] text-muted2">{prog.done}/{prog.total}</div>
        </div>
      </PixelPanel>

      {/* Map */}
      <PixelPanel hue="green" className="relative overflow-hidden p-0">
        <div className="relative h-[470px] w-full" style={{ background: "linear-gradient(180deg, #3b7d46 0%, #2e6238 60%, #274f30 100%)" }}>
          {/* decorations */}
          <PixelTree x={6} b={20} s={26} />
          <PixelTree x={86} b={64} s={22} />
          <PixelTree x={10} b={70} s={20} />
          <PixelTree x={80} b={14} s={24} />
          {/* pond */}
          <div className="absolute" style={{ right: "6%", bottom: "30%", width: 54, height: 30, background: "radial-gradient(circle at 40% 35%, #6fc3e8, #2f7fb0)", borderRadius: "50%", border: "2px solid #1f5a82" }} aria-hidden />

          {/* dotted path */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <path d={pathD} fill="none" stroke="#c9a35f" strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <path d={pathD} fill="none" stroke="#e8c98a" strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" strokeDasharray="0.1 9" vectorEffect="non-scaling-stroke" />
          </svg>

          {/* FINAL TRIAL near top-centre, below the overlay row */}
          <Link href={bStatus !== "locked" ? `/academy/boss/${TIER0_BOSS.id}` : "#"} className="absolute left-1/2 -translate-x-1/2" style={{ bottom: "84%" }}>
            <div className="flex flex-col items-center">
              <span className="px-label mb-0.5 rounded-[3px] border border-[var(--px-edge)] bg-[var(--color-panel)] px-1 text-[0.4rem] text-brass">Trial</span>
              <div className={`flex h-12 w-12 items-center justify-center rounded-[7px] border-[3px] font-display text-xl ${
                bStatus === "completed" ? "border-[var(--px-edge)] bg-brass text-[color:var(--color-on-accent)] tab-glow-reward"
                : bStatus === "ready" ? "border-brass bg-[#243056] text-brass tab-pulse"
                : "border-[#243056] bg-[#1a2344] text-muted2"}`} style={{ boxShadow: "0 0 0 2px var(--px-edge)" }}>
                {bStatus === "completed" ? "✓" : "♛"}
              </div>
            </div>
          </Link>

          {/* treasure */}
          <button type="button" onClick={midReady ? claimMidChest : undefined} className="absolute" style={{ right: "8%", bottom: "44%" }}>
            <div className="flex flex-col items-center">
              <PixelChest state={midClaimed ? "open" : midReady ? "ready" : "locked"} size={42} className={midReady ? "tab-bob" : ""} />
              <span className="px-label rounded-[3px] border border-[var(--px-edge)] bg-[#5a3a18] px-1 text-[0.4rem] text-[#ffe0a0]">Treasure</span>
            </div>
          </button>

          {/* nodes */}
          {nodes.map((nd) => {
            const tappable = nd.status !== "locked";
            const inner = <PixelMapNode n={nd.lesson.order} status={nd.status} stars={nd.stars} size={44} />;
            return (
              <div key={nd.lesson.id} className="absolute -translate-x-1/2 translate-y-1/2" style={{ left: `${nd.x}%`, bottom: `${nd.y}%` }}>
                {tappable ? <Link href={`/academy/${nd.lesson.id}`} aria-label={nd.lesson.title}>{inner}</Link> : inner}
              </div>
            );
          })}

          {/* overlay: current lesson (top-left) */}
          <Link href={step.href} className="absolute left-1.5 top-1.5 w-[35%]">
            <PixelPanel hue="blue" className="px-1.5 py-1.5">
              <p className="px-label text-[0.4rem] text-brass">Current Lesson ›</p>
              <p className="mt-0.5 truncate text-[0.54rem] font-bold text-cream">{step.title}</p>
              <div className="px-track mt-1 h-1.5">
                <div className="px-track-fill" style={{ width: `${Math.round(prog.pct * 100)}%`, "--fill": "var(--color-good)" } as React.CSSProperties} />
              </div>
            </PixelPanel>
          </Link>

          {/* overlay: stars collected (top-right) */}
          <div className="absolute right-1.5 top-1.5 w-[35%]">
            <PixelPanel hue="purple" className="px-1.5 py-1.5">
              <p className="px-label text-[0.4rem] text-brass">Stars</p>
              <div className="mt-0.5 flex items-center gap-1">
                <StarIcon size={12} />
                <span className="font-display text-[0.62rem] text-cream">{starsEarned}/{starsTotal}</span>
              </div>
              <div className="px-track mt-1 h-1.5">
                <div className="px-track-fill" style={{ width: `${starsTotal ? Math.round((starsEarned / starsTotal) * 100) : 0}%`, "--fill": "var(--color-brass)" } as React.CSSProperties} />
              </div>
            </PixelPanel>
          </div>
        </div>
      </PixelPanel>

      {/* Bottom banner */}
      <PixelPanel hue="gold" className="flex items-center gap-2 px-2.5 py-2">
        <span className="text-[1rem]" aria-hidden>🛡️</span>
        <div className="min-w-0 flex-1">
          <p className="px-label text-[0.5rem] text-brass">{tierLabel}: {tierName}</p>
          <p className="truncate text-[0.5rem] text-muted2">Master the basics and build a strong foundation.</p>
        </div>
        <PixelChest state={midClaimed ? "open" : "locked"} size={28} />
      </PixelPanel>

      <RewardModal open={modal.open} onClose={() => setModal({ open: false, xp: 0 })} title="Path Reward!" xp={modal.xp} piece="king" subtitle="A treasure for reaching the halfway mark." />
    </div>
  );
}
