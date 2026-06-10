import { Suspense } from "react";
import ReviewScreen from "@/features/play/ReviewScreen";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ReviewScreen />
    </Suspense>
  );
}
