type Tone = "default" | "brass" | "good" | "muted";

const TONE: Record<Tone, string> = {
  default: "text-cream",
  brass: "text-brass",
  good: "text-good",
  muted: "text-muted2",
};

/** Compact labelled stat used in snapshot rows. */
export default function StatPill({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
}) {
  return (
    <div className="tab-card flex flex-col gap-1 px-3 py-2.5">
      <span className="text-[10px] uppercase tracking-wider text-muted2">{label}</span>
      <span className={`font-display text-lg leading-none ${TONE[tone]}`}>{value}</span>
      {sub ? <span className="text-[10px] text-muted2">{sub}</span> : null}
    </div>
  );
}
