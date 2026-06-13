"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfileStore, academyStateFrom } from "@/state/profileStore";
import { lessonsForTier, tierMeta } from "@/content/academy";
import {
  lessonStatus,
  bossStatus,
  tierProgress,
  isTierUnlocked,
  type AcademyState,
} from "@/domain/academy/progression";
import PixelTopBar from "@/components/pixel/PixelTopBar";
import PixelPanel from "@/components/pixel/PixelPanel";
import PixelMapNode, { type MapNodeStatus } from "@/components/pixel/PixelMapNode";
import PixelOrnateChest from "@/components/pixel/PixelOrnateChest";
import { StarIcon } from "@/components/pixel/PixelIcon";
import ChessBuddy from "@/components/characters/ChessBuddy";
import { GUIDES } from "@/content/guides";
import RewardModal from "@/components/ui/RewardModal";

const MID_REWARD_ID = "tier0-mid";
const MID_REWARD_XP = 40;
const TIERS = [0, 1];

const ANCHORS = [
  { l: 50, b: 4 }, { l: 27, b: 15 }, { l: 70, b: 24 }, { l: 31, b: 35 },
  { l: 68, b: 45 }, { l: 35, b: 55 }, { l: 64, b: 64 }, { l: 47, b: 73 },
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

function TierWorld({
  tier,
  state,
  onClaimMid,
  midClaimed,
}: {
  tier: number;
  state: AcademyState;
  onClaimMid: () => void;
  midClaimed: boolean;
}) {
  const completed = useProfileStore((s) => s.completed);
  const unlocked = isTierUnlocked(tier, state);
  const lessons = lessonsForTier(tier).slice(0, ANCHORS.length);
  const prog = tierProgress(tier, state);
  const meta = tierMeta(tier);
  const boss = meta?.boss;
  const bStatus = boss ? bossStatus(boss.id, state) : "locked";
  const tierName = (meta?.title ?? `Tier ${tier}`).replace(/^Tier \d+ · /, "");

  const starsEarned = lessons.reduce((sum, l) => sum + (completed[l.id]?.stars ?? 0), 0);
  const starsTotal = lessons.length * 3;

  const current = lessons.find((l) => lessonStatus(l, state) === "available");
  const midReady = tier === 0 && prog.done >= 4 && !midClaimed;

  const nodes = lessons.map((lesson, i) => {
    const st = lessonStatus(lesson, state);
    const status: MapNodeStatus = st === "completed" ? "completed" : st === "available" ? "current" : "locked";
    return { lesson, status, stars: completed[lesson.id]?.stars ?? 0, x: ANCHORS[i].l, y: ANCHORS[i].b };
  });
  const pts = ANCHORS.slice(0, lessons.length).map((a) => `${a.l} ${100 - a.b}`);
  const pathD = `M ${pts.join(" L ")}`;

  return (
    <div className="w-full shrink-0 space-y-2 px-0.5">
      {/* Tier summary badge */}
      <PixelPanel hue="gold" className="flex items-center justify-between gap-2 px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <span aria-hidden>🛡️</span>
          <div>
            <div className="px-label text-[0.56rem] text-brass">Tier {tier}</div>
            <div className="px-label text-[0.4rem] text-muted2">Class Lv. {prog.done + 1}</div>
          </div>
        </div>
        <div className="min-w-0 flex-1 px-2">
          <div className="px-track h-2.5">
            <div className="px-track-fill" style={{ width: `${Math.round(prog.pct * 100)}%`, "--fill": "var(--color-good)" } as React.CSSProperties} />
          </div>
        </div>
        <div className="px-inset flex items-center gap-1 px-1.5 py-1">
          <StarIcon size={11} />
          <span className="font-display text-[0.52rem] text-cream">{starsEarned}/{starsTotal}</span>
        </div>
      </PixelPanel>

      {/* Map */}
      <PixelPanel hue={unlocked ? "green" : "purple"} className="relative overflow-hidden p-0">
        <div className={`relative h-[430px] w-full ${unlocked ? "" : "opacity-60 grayscale"}`} style={{ background: "linear-gradient(180deg, #3b7d46 0%, #2e6238 60%, #274f30 100%)" }}>
          <PixelTree x={6} b={20} s={26} />
          <PixelTree x={86} b={62} s={22} />
          <PixelTree x={10} b={70} s={20} />
          <PixelTree x={80} b={12} s={24} />
          <div className="absolute" style={{ right: "6%", bottom: "30%", width: 48, height: 26, background: "radial-gradient(circle at 40% 35%, #6fc3e8, #2f7fb0)", borderRadius: "50%", border: "2px solid #1f5a82" }} aria-hidden />

          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <path d={pathD} fill="none" stroke="#c9a35f" strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <path d={pathD} fill="none" stroke="#e8c98a" strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" strokeDasharray="0.1 9" vectorEffect="non-scaling-stroke" />
          </svg>

          {/* Final trial */}
          <Link href={boss && bStatus !== "locked" ? `/academy/boss/${boss.id}` : "#"} className="absolute left-1/2 -translate-x-1/2" style={{ bottom: "84%" }}>
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

          {/* Treasure */}
          <button type="button" onClick={midReady ? onClaimMid : undefined} className="absolute" style={{ right: "8%", bottom: "44%" }}>
            <div className="flex flex-col items-center">
              <PixelOrnateChest state={tier === 0 && midClaimed ? "open" : midReady ? "ready" : "locked"} size={44} />
              <span className="px-label rounded-[3px] border border-[var(--px-edge)] bg-[#5a3a18] px-1 text-[0.4rem] text-[#ffe0a0]">Treasure</span>
            </div>
          </button>

          {/* Nodes */}
          {nodes.map((nd) => {
            const tappable = nd.status !== "locked";
            const inner = <PixelMapNode n={nd.lesson.order} status={nd.status} stars={nd.stars} size={42} />;
            return (
              <div key={nd.lesson.id} className="absolute -translate-x-1/2 translate-y-1/2" style={{ left: `${nd.x}%`, bottom: `${nd.y}%` }}>
                {tappable ? <Link href={`/academy/${nd.lesson.id}`} aria-label={nd.lesson.title}>{inner}</Link> : inner}
              </div>
            );
          })}

          {/* Current lesson overlay */}
          {current ? (
            <Link href={`/academy/${current.id}`} className="absolute left-1.5 top-1.5 w-[37%]">
              <PixelPanel hue="blue" className="px-1.5 py-1.5">
                <p className="px-label text-[0.4rem] text-brass">Current ›</p>
                <p className="mt-0.5 truncate text-[0.52rem] font-bold text-cream">{current.title}</p>
                <div className="px-track mt-1 h-1.5">
                  <div className="px-track-fill" style={{ width: `${Math.round(prog.pct * 100)}%`, "--fill": "var(--color-good)" } as React.CSSProperties} />
                </div>
              </PixelPanel>
            </Link>
          ) : null}

          {/* Stars overlay */}
          <div className="absolute right-1.5 top-1.5 w-[37%]">
            <PixelPanel hue="purple" className="px-1.5 py-1.5">
              <p className="px-label text-[0.4rem] text-brass">Stars</p>
              <div className="mt-0.5 flex items-center gap-1">
                <StarIcon size={12} />
                <span className="font-display text-[0.6rem] text-cream">{starsEarned}/{starsTotal}</span>
              </div>
              <div className="px-track mt-1 h-1.5">
                <div className="px-track-fill" style={{ width: `${starsTotal ? Math.round((starsEarned / starsTotal) * 100) : 0}%`, "--fill": "var(--color-brass)" } as React.CSSProperties} />
              </div>
            </PixelPanel>
          </div>

          {/* Locked overlay */}
          {!unlocked ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="px-panel px-3 py-2 text-center">
                <p className="px-label text-[0.5rem] text-brass">🔒 Locked</p>
                <p className="mt-0.5 text-[0.52rem] text-muted2">Clear the Tier 0 Trial</p>
              </div>
            </div>
          ) : null}
        </div>
      </PixelPanel>

      {/* Bottom strip */}
      <PixelPanel hue="gold" className="flex items-center gap-2 px-2.5 py-1.5">
        <div className="flex shrink-0 items-center gap-1">
          <ChessBuddy piece={GUIDES.oracle.piece} size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="px-label text-[0.5rem] text-brass">Tier {tier}: {tierName}</p>
          <p className="truncate text-[0.5rem] text-muted2">{prog.done}/{prog.total} lessons · master the basics.</p>
        </div>
        <PixelOrnateChest state={tier === 0 && midClaimed ? "open" : "locked"} size={28} />
      </PixelPanel>
    </div>
  );
}

export default function AcademyScreen() {
  const completed = useProfileStore((s) => s.completed);
  const bossClearedMap = useProfileStore((s) => s.bossCleared);
  const claimedRewards = useProfileStore((s) => s.claimedRewards);
  const claimReward = useProfileStore((s) => s.claimReward);
  const [modal, setModal] = useState<{ open: boolean; xp: number }>({ open: false, xp: 0 });
  const [tierIdx, setTierIdx] = useState(0);

  useEffect(() => {
    void useProfileStore.getState().hydrate();
  }, []);

  const state = academyStateFrom(completed, bossClearedMap);
  const midClaimed = Boolean(claimedRewards[MID_REWARD_ID]);

  async function claimMidChest() {
    const got = await claimReward(MID_REWARD_ID, MID_REWARD_XP);
    if (got > 0) setModal({ open: true, xp: got });
  }

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
        {/* tier pager arrows */}
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => setTierIdx((i) => Math.max(0, i - 1))} disabled={tierIdx === 0}
            className="px-inset flex h-7 w-7 items-center justify-center text-brass disabled:opacity-30 active:translate-y-0.5" aria-label="Previous tier">‹</button>
          <div className="flex gap-1">
            {TIERS.map((t, i) => (
              <span key={t} className={`h-2 w-2 rounded-full border-2 border-[var(--px-edge)] ${i === tierIdx ? "bg-brass" : "bg-[var(--color-ink)]"}`} />
            ))}
          </div>
          <button type="button" onClick={() => setTierIdx((i) => Math.min(TIERS.length - 1, i + 1))} disabled={tierIdx === TIERS.length - 1}
            className="px-inset flex h-7 w-7 items-center justify-center text-brass disabled:opacity-30 active:translate-y-0.5" aria-label="Next tier">›</button>
        </div>
      </PixelPanel>

      {/* Horizontal tier pager */}
      <div className="overflow-hidden">
        <div className="flex transition-transform duration-300 ease-out" style={{ transform: `translateX(-${tierIdx * 100}%)` }}>
          {TIERS.map((t) => (
            <TierWorld key={t} tier={t} state={state} onClaimMid={claimMidChest} midClaimed={midClaimed} />
          ))}
        </div>
      </div>

      <RewardModal open={modal.open} onClose={() => setModal({ open: false, xp: 0 })} title="Path Reward!" xp={modal.xp} piece="king" subtitle="A treasure for reaching the halfway mark." />
    </div>
  );
}
