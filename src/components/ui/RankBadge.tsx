/** A brass emblem + rank title, used in the hero and on the profile card. */
export default function RankBadge({
  title,
  size = "md",
}: {
  title: string;
  size?: "sm" | "md";
}) {
  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-brass/40 bg-brass/10 ${pad}`}
    >
      <span className="text-brass" aria-hidden>
        ♛
      </span>
      <span className="font-display text-cream">{title}</span>
    </span>
  );
}
