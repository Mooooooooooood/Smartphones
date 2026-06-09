export default function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-panel/60 p-3 text-center">
      <div className="font-display text-2xl text-cream">{value}</div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wider text-muted2">{label}</div>
      {hint ? <div className="mt-0.5 text-[10px] text-muted2">{hint}</div> : null}
    </div>
  );
}
