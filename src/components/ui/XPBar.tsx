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
    <div className={`h-2.5 w-full overflow-hidden rounded-full bg-ink2 ${className}`}>
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{
          width: `${pct}%`,
          backgroundImage: "linear-gradient(90deg, #b8923c 0%, #d9b25a 60%, #f0cf80 100%)",
        }}
      />
    </div>
  );
}
