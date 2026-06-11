/**
 * The bronze console bezel that frames the whole screen in the mockups.
 * Rendered as a fixed, non-interactive overlay pinned to the centered phone
 * column, with a corner bolt in each corner. Content/nav sit inside it.
 */
export default function PixelShell() {
  const bolt = "px-bolt";
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 mx-auto max-w-md">
      <div className="px-shell absolute inset-[3px]" />
      <span className={bolt} style={{ top: 7, left: 7 }} />
      <span className={bolt} style={{ top: 7, right: 7 }} />
      <span className={bolt} style={{ bottom: 7, left: 7 }} />
      <span className={bolt} style={{ bottom: 7, right: 7 }} />
    </div>
  );
}
