import BossScreen from "@/features/academy/BossScreen";
import { BOSSES } from "@/content/academy";

export function generateStaticParams() {
  return BOSSES.map((b) => ({ bossId: b.id }));
}

export default async function Page({ params }: { params: Promise<{ bossId: string }> }) {
  const { bossId } = await params;
  return <BossScreen bossId={bossId} />;
}
