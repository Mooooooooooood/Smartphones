import { getDb, type DailyTrainingRow } from "./db";

export async function loadDailyTraining(date: string): Promise<DailyTrainingRow | null> {
  try {
    return (await getDb().dailyTraining.get(date)) ?? null;
  } catch {
    return null;
  }
}

export async function saveDailyTraining(row: DailyTrainingRow): Promise<void> {
  try {
    await getDb().dailyTraining.put(row);
  } catch {
    /* storage unavailable */
  }
}

export async function countDailyCompletions(): Promise<number> {
  try {
    const all = await getDb().dailyTraining.toArray();
    return all.filter((d) => d.completedAt !== null).length;
  } catch {
    return 0;
  }
}
