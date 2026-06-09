import LessonScreen from "@/features/academy/LessonScreen";
import { ALL_LESSONS } from "@/content/academy";

export function generateStaticParams() {
  return ALL_LESSONS.map((l) => ({ lessonId: l.id }));
}

export default async function Page({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  return <LessonScreen lessonId={lessonId} />;
}
