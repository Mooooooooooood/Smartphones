"use client";

import { useGameStore } from "@/state/gameStore";

export default function MoveList() {
  const history = useGameStore((s) => s.snap.history);

  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-panel/50 p-3 text-center text-xs text-muted2">
        No moves yet — make the first move.
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
    <div className="rounded-xl border border-line bg-panel/50 p-2">
      <div className="max-h-40 overflow-y-auto">
        <table className="w-full text-sm tabular-nums">
          <tbody>
            {rows.map((r, ri) => (
              <tr key={r.n} className="text-cream">
                <td className="w-8 py-0.5 pr-2 text-right text-muted2">{r.n}.</td>
                <td className={`py-0.5 pr-3 font-medium ${ri * 2 === last ? "text-brass" : ""}`}>{r.w}</td>
                <td className={`py-0.5 font-medium ${ri * 2 + 1 === last ? "text-brass" : ""}`}>{r.b ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
