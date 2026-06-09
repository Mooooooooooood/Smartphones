export default function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-panel2 ${className}`}>
      <div
        className="h-full rounded-full bg-brass transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
