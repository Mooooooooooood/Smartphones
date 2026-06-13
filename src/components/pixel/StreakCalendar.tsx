"use client";

import { streakCalendar, isTodayActive } from "@/domain/progression/streak";
import { FlameIcon } from "@/components/pixel/PixelIcon";

/**
 * Compact pixel streak calendar — last 14 days, active days lit, today ringed.
 * Derived purely from streak + lastActiveDate (no stored history, no cloud).
 */
export default function StreakCalendar({
  streak,
  lastActiveDate,
  days = 14,
}: {
  streak: number;
  lastActiveDate: string | null;
  days?: number;
}) {
  const cal = streakCalendar(lastActiveDate, streak, undefined, days);
  const todayDone = isTodayActive(lastActiveDate);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <FlameIcon size={13} />
          <span className="font-display text-[0.66rem] text-brass">{streak}</span>
          <span className="px-label text-[0.46rem] text-muted2">day streak</span>
        </span>
        <span className="px-label text-[0.42rem] text-muted2">{todayDone ? "✓ today counted" : "play to keep it"}</span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cal.map((d) => (
          <div key={d.date} className="flex flex-col items-center gap-0.5">
            <span className="px-label text-[0.36rem] text-muted2">{d.dow}</span>
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-[4px] border-2 text-[0.42rem] ${
                d.active
                  ? "border-[var(--px-edge)] bg-brass text-[color:var(--color-on-accent)]"
                  : "border-[var(--px-edge)] bg-[var(--color-ink)] text-muted2"
              } ${d.isToday ? "ring-2 ring-good" : ""}`}
            >
              {d.active ? "★" : d.dom}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-center text-[0.46rem] text-muted2">Do any lesson, puzzle or match each day to grow your streak.</p>
    </div>
  );
}
