import { Suspense } from "react";
import PuzzleScreen from "@/features/puzzles/PuzzleScreen";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PuzzleScreen />
    </Suspense>
  );
}
