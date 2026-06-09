/** Streak flame. Animates gently unless the streak is cold (0). */
export default function FlameIcon({
  active = true,
  size = 16,
}: {
  active?: boolean;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={active ? "tab-flame-icon" : ""}
      aria-hidden
    >
      <path
        d="M12 2c1 3-1 4.5-2.5 6.5C8 10.3 7 11.8 7 14a5 5 0 0 0 10 0c0-2-1-3.6-2-5-1 1-2 1.4-2.6.4C11.6 8 13 6 12 2z"
        fill={active ? "#d9b25a" : "#5a4d35"}
      />
      <path
        d="M12 12c.7 1 .4 2-.2 2.7-.5.6-.8 1.3-.8 2a2 2 0 0 0 4 0c0-1.4-1-2-1.4-3-.4.5-1 .6-1.3 0z"
        fill={active ? "#f0cf80" : "#7a6a48"}
      />
    </svg>
  );
}
