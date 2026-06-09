export default function ComingSoon({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="font-display text-3xl text-cream">{title}</h1>
      <p className="mt-2 max-w-xs text-sm text-muted">{blurb}</p>
      <span className="mt-5 rounded-full border border-line px-3 py-1 text-xs uppercase tracking-wider text-brass">
        Coming in a later sprint
      </span>
    </div>
  );
}
