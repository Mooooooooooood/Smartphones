/** Side selection for a match. Pure so it can be unit-tested. */
export type SideChoice = "w" | "b" | "random";

export function resolveSide(choice: SideChoice, rng: () => number = Math.random): "w" | "b" {
  if (choice === "random") return rng() < 0.5 ? "w" : "b";
  return choice;
}
