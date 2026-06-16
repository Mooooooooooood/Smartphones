/**
 * Per-tier Academy world theming. Each tier renders the same map layout but a
 * different biome background. Tier 0 keeps the original green island; later tiers
 * get their own sky/pond/path so the worlds feel distinct as you progress.
 */
export interface TierTheme {
  /** Full CSS for the world background gradient (sky → ground). */
  sky: string;
  /** Wandering-path strokes (solid base + dashed highlight). */
  pathStroke: string;
  pathDash: string;
  /** Pond fill (radial-gradient css) + border. */
  pond: string;
  pondBorder: string;
}

const ISLAND: TierTheme = {
  sky: "linear-gradient(180deg, #8ed0e8 0%, #6fb8d8 9%, #62c47e 20%, #4aa863 48%, #34904f 78%, #277a40 100%)",
  pathStroke: "#c9a35f",
  pathDash: "#e8c98a",
  pond: "radial-gradient(circle at 40% 35%, #8fd6ef, #2f7fb0)",
  pondBorder: "#1f5a82",
};

const TWILIGHT: TierTheme = {
  // Dusk: violet sky → warm sunset horizon → shadowed evening meadow.
  sky: "linear-gradient(180deg, #2b2356 0%, #4a3a7a 14%, #8a4f86 30%, #c4685a 44%, #a06a4e 54%, #6f8a52 68%, #4f6b3e 84%, #38502f 100%)",
  pathStroke: "#b98a4a",
  pathDash: "#f0d29a",
  pond: "radial-gradient(circle at 40% 35%, #e3a6e0, #7a4fa8)",
  pondBorder: "#4a2c63",
};

const TIER_THEMES: Record<number, TierTheme> = {
  0: ISLAND,
  1: TWILIGHT,
};

/** Theme for a tier, falling back to the Tier-0 island. */
export function tierTheme(tier: number): TierTheme {
  return TIER_THEMES[tier] ?? ISLAND;
}
