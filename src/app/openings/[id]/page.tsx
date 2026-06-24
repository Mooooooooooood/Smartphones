import { notFound } from "next/navigation";
import OpeningTrainer from "@/features/openings/OpeningTrainer";
import { OPENINGS, openingById } from "@/content/openings";

export function generateStaticParams() {
  return OPENINGS.map((o) => ({ id: o.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opening = openingById(id);
  if (!opening) notFound();
  return <OpeningTrainer opening={opening} />;
}
