import LessonScreen from "@/features/academy/LessonScreen";
import { TIER0_LESSONS } from "@/content/academy/tier0";

export function generateStaticParams() {
  return TIER0_LESSONS.map((l) => ({ lessonId: l.id }));
}

export default async function Page({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  return <LessonScreen lessonId={lessonId} />;
}
