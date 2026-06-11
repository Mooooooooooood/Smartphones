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
    <div className="px-inset flex flex-col items-center gap-0.5 px-2 py-2 text-center">
      <span className="px-label text-[0.5rem] text-muted2">{label}</span>
      <span className={`font-display text-[0.8rem] leading-none ${TONE[tone]}`}>{value}</span>
      {sub ? <span className="text-[0.56rem] text-muted2">{sub}</span> : null}
    </div>
  );
}
