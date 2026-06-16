"use client";

import type { CSSProperties, ReactNode } from "react";
import { fx } from "@/lib/feedback";

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  sub?: string;
  glyph?: ReactNode;
}

/**
 * Shared segmented control. Two layouts:
 *  - "scroll" — a horizontally-scrolling row of small pills (puzzle theme filter).
 *  - "grid"   — a fixed N-column grid of stacked glyph/label/sub cells (side picker).
 * Replaces the near-identical active/inactive className ternaries those screens
 * used to inline. The active accent is always arcade brass.
 */
export default function SegmentControl<T extends string>({
  options,
  value,
  onChange,
  layout = "scroll",
  cols = 3,
  className = "",
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  layout?: "scroll" | "grid";
  cols?: number;
  className?: string;
}) {
  const pick = (v: T) => {
    fx.tap();
    onChange(v);
  };

  if (layout === "grid") {
    return (
      <div className={`grid gap-2 ${className}`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => pick(opt.value)}
              className={`px-inset flex flex-col items-center gap-0.5 py-2.5 text-center active:translate-y-0.5 ${active ? "!border-brass" : ""}`}
              style={active ? ({ boxShadow: "inset 0 0 0 2px var(--color-brass)" } as CSSProperties) : undefined}
            >
              {opt.glyph != null ? (
                <span className={`text-xl ${active ? "text-brass" : "text-muted"}`} aria-hidden>{opt.glyph}</span>
              ) : null}
              <span className="px-label text-[0.5rem] text-cream">{opt.label}</span>
              {opt.sub ? <span className="text-[0.5rem] leading-tight text-muted2">{opt.sub}</span> : null}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`-mx-3 overflow-x-auto px-3 ${className}`}>
      <div className="flex w-max gap-1.5">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => pick(opt.value)}
              className={`px-label inline-flex shrink-0 items-center gap-1 rounded-[5px] border-2 px-2.5 py-1.5 text-[0.5rem] active:translate-y-0.5 ${
                active ? "border-brass bg-[var(--color-ink)] text-brass" : "border-[var(--px-edge)] bg-panel text-muted2"
              }`}
            >
              {opt.glyph != null ? <span aria-hidden>{opt.glyph}</span> : null}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
