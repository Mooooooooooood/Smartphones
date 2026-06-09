import type { ReactNode } from "react";

/** Friendly, on-brand empty state instead of dead stats or blank space. */
export default function EmptyState({
  icon,
  title,
  blurb,
  action,
}: {
  icon?: ReactNode;
  title: string;
  blurb: string;
  action?: ReactNode;
}) {
  return (
    <div className="tab-card flex flex-col items-center gap-2 px-5 py-8 text-center">
      {icon ? (
        <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full border border-brass/30 bg-brass/10 text-2xl text-brass">
          {icon}
        </div>
      ) : null}
      <h3 className="font-display text-lg text-cream">{title}</h3>
      <p className="max-w-xs text-sm text-muted">{blurb}</p>
      {action ? <div className="mt-3 w-full max-w-xs">{action}</div> : null}
    </div>
  );
}
