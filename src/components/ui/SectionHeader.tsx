import type { ReactNode } from "react";

/** Consistent eyebrow + title header for a section, with an optional trailing action. */
export default function SectionHeader({
  eyebrow,
  title,
  action,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-3 flex items-end justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.16em] text-muted2">{eyebrow}</p>
        ) : null}
        <h2 className="font-display text-xl text-cream">{title}</h2>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
