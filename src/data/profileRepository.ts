import { getDb, type LessonProgressRow, type ProfileRow } from "./db";

export async function loadProfile(): Promise<ProfileRow | null> {
  try {
    return (await getDb().profile.get("me")) ?? null;
  } catch {
    /* storage unavailable */
    return null;
  }
}

export async function saveProfile(p: ProfileRow): Promise<void> {
  try {
    await getDb().profile.put(p);
  } catch {
    /* storage unavailable */
  }
}

export async function loadLessonProgress(): Promise<LessonProgressRow[]> {
  try {
    return await getDb().lessonProgress.toArray();
  } catch {
    /* storage unavailable */
    return [];
  }
}

export async function saveLessonProgress(row: LessonProgressRow): Promise<void> {
  try {
    await getDb().lessonProgress.put(row);
  } catch {
    /* storage unavailable */
  }
}
