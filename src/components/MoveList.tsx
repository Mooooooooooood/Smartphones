"use client";

import { useGameStore } from "@/state/gameStore";

export default function MoveList() {
  const history = useGameStore((s) => s.snap.history);

  if (history.length === 0) {
    return (
      <div className="tab-card flex flex-col items-center gap-1 px-4 py-6 text-center">
        <span className="text-2xl text-muted2" aria-hidden>
          ♟
        </span>
        <p className="text-sm font-semibold text-cream">No moves yet</p>
        <p className="text-xs text-muted2">Make the first move to begin the game.</p>
      </div>
    );
  }

  const rows: { n: number; w?: string; b?: string }[] = [];
  history.forEach((m, i) => {
    const n = Math.floor(i / 2);
    if (i % 2 === 0) rows[n] = { n: n + 1, w: m.san };
    else rows[n].b = m.san;
  });
  const last = history.length - 1;

  return (
    <div className="tab-card p-3">
      <p className="mb-1.5 text-[11px] uppercase tracking-wider text-muted2">Moves</p>
      <div className="max-h-44 overflow-y-auto">
        <table className="w-full text-sm tabular-nums">
          <tbody>
            {rows.map((r, ri) => (
              <tr key={r.n} className="text-cream">
                <td className="w-8 py-1 pr-2 text-right text-muted2">{r.n}.</td>
                <td className={`py-1 pr-3 font-medium ${ri * 2 === last ? "text-brass" : ""}`}>{r.w}</td>
                <td className={`py-1 font-medium ${ri * 2 + 1 === last ? "text-brass" : ""}`}>
                  {r.b ?? ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
