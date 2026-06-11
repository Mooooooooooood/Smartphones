/** Gradient XP / progress bar. `value` is 0..1. */
export default function XPBar({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={`px-track h-3 w-full ${className}`}>
      <div className="px-track-fill" style={{ width: `${pct}%`, "--fill": "var(--color-brass)" } as React.CSSProperties} />
    </div>
  );
}
