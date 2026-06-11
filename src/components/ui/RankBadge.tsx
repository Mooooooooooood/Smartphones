/** A brass emblem + rank title, used in the hero and on the profile card. */
export default function RankBadge({
  title,
  size = "md",
}: {
  title: string;
  size?: "sm" | "md";
}) {
  const pad = size === "sm" ? "px-2 py-1 text-[0.52rem]" : "px-2.5 py-1.5 text-[0.6rem]";
  return (
    <span className={`px-inset inline-flex items-center gap-1.5 ${pad}`}>
      <span className="text-brass" aria-hidden>♛</span>
      <span className="px-label text-cream">{title}</span>
    </span>
  );
}
