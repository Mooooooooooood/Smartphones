"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { TIER0_LESSONS } from "@/content/academy/tier0";
import { useProfileStore, lessonStatus } from "@/state/profileStore";

const LessonBoard = dynamic(() => import("@/components/LessonBoard"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto aspect-square w-full max-w-[320px] animate-pulse rounded-lg bg-panel2" />
  ),
});

export default function LessonScreen({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const completed = useProfileStore((s) => s.completed);
  const hydrated = useProfileStore((s) => s.hydrated);
  const completeLesson = useProfileStore((s) => s.completeLesson);

  useEffect(() => {
    void useProfileStore.getState().hydrate();
  }, []);

  const lesson = useMemo(() => TIER0_LESSONS.find((l) => l.id === lessonId), [lessonId]);

  const [picked, setPicked] = useState<number | null>(null);
  const [firstTry, setFirstTry] = useState(true);
  const [justEarned, setJustEarned] = useState<number | null>(null);

  if (!lesson) {
    return (
      <div className="py-12 text-center">
        <h1 className="font-display text-2xl text-cream">Lesson not found</h1>
        <Link href="/academy" className="mt-3 inline-block text-brass">
          Back to Academy
        </Link>
      </div>
    );
  }

  // Wait for hydration so we know the real completion/lock state before rendering.
  if (!hydrated) {
    return <div className="py-20 text-center text-sm text-muted2">Loading lesson…</div>;
  }

  if (lessonStatus(lesson.order, completed) === "locked") {
    return (
      <div className="py-12 text-center">
        <h1 className="font-display text-2xl text-cream">Locked</h1>
        <p className="mt-2 text-sm text-muted">Finish the previous lesson first.</p>
        <Link href="/academy" className="mt-3 inline-block text-brass">
          Back to Academy
        </Link>
      </div>
    );
  }

  const alreadyDone = Boolean(completed[lesson.id]);
  const correct = picked !== null && picked === lesson.quiz.correctIndex;
  const nextSeq = TIER0_LESSONS.find((l) => l.order === lesson.order + 1) ?? null;

  function choose(i: number) {
    if (!lesson || correct) return; // lock choices once answered correctly
    setPicked(i);
    if (i !== lesson.quiz.correctIndex) setFirstTry(false);
  }

  async function finish() {
    if (!lesson || !correct || alreadyDone) return;
    const stars = firstTry ? 3 : 2;
    const ok = await completeLesson(lesson.id, lesson.xpReward, stars);
    if (ok) setJustEarned(lesson.xpReward);
  }

  const showNext = (alreadyDone || justEarned !== null) && nextSeq;

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <Link href="/academy" className="text-sm text-muted">
          ‹ Academy
        </Link>
        <span className="text-xs text-muted2">
          Lesson {lesson.order} of {TIER0_LESSONS.length}
        </span>
      </div>

      <header>
        <h1 className="font-display text-3xl text-cream">{lesson.title}</h1>
        <p className="mt-1 text-sm text-muted">{lesson.subtitle}</p>
      </header>

      {lesson.fen ? (
        <div className="mx-auto w-full max-w-[320px]">
          <LessonBoard fen={lesson.fen} />
          {lesson.boardCaption ? (
            <p className="mt-2 text-center text-xs text-muted2">{lesson.boardCaption}</p>
          ) : null}
        </div>
      ) : null}

      <p className="text-sm leading-relaxed text-cream/90">{lesson.explanation}</p>

      <ul className="space-y-1.5">
        {lesson.keyPoints.map((k, i) => (
          <li key={i} className="flex gap-2 text-sm text-muted">
            <span className="text-brass">•</span>
            <span>{k}</span>
          </li>
        ))}
      </ul>

      <section className="rounded-2xl border border-line bg-panel/60 p-4">
        <h2 className="font-display text-lg text-cream">{lesson.quiz.question}</h2>
        <div className="mt-3 space-y-2">
          {lesson.quiz.choices.map((c, i) => {
            const isPicked = picked === i;
            const showCorrect = picked !== null && i === lesson.quiz.correctIndex;
            const showWrong = isPicked && i !== lesson.quiz.correctIndex;
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={correct}
                className={`w-full rounded-xl border px-3.5 py-3 text-left text-sm transition-colors disabled:cursor-default ${
                  showCorrect
                    ? "border-good/60 bg-good/15 text-cream"
                    : showWrong
                      ? "border-bad/60 bg-bad/15 text-cream"
                      : "border-line bg-panel text-cream hover:border-muted2"
                }`}
              >
                {c}
                {showCorrect ? <span className="float-right text-good">✓</span> : null}
                {showWrong ? <span className="float-right text-bad">✗</span> : null}
              </button>
            );
          })}
        </div>
        {picked !== null && !correct ? (
          <p className="mt-3 text-xs text-bad">Not quite — try again.</p>
        ) : null}
        {correct && !alreadyDone ? (
          <p className="mt-3 text-xs text-good">Correct! Claim your XP below.</p>
        ) : null}
      </section>

      <div className="space-y-3">
        {alreadyDone ? (
          <div className="rounded-xl border border-brass/30 bg-brass/10 px-4 py-3 text-center text-sm text-brass">
            Lesson completed{completed[lesson.id]?.stars ? ` · ${completed[lesson.id].stars}★` : ""}
          </div>
        ) : justEarned !== null ? (
          <div className="rounded-xl border border-good/40 bg-good/15 px-4 py-3 text-center text-sm text-cream">
            +{justEarned} XP earned
          </div>
        ) : (
          <button
            onClick={finish}
            disabled={!correct}
            className="w-full rounded-xl border border-brass/50 bg-brass/15 px-4 py-3 text-sm font-semibold text-brass transition-colors disabled:opacity-40"
          >
            Complete lesson (+{lesson.xpReward} XP)
          </button>
        )}

        <div className="flex gap-2">
          <Link
            href="/academy"
            className="flex-1 rounded-xl border border-line bg-panel px-4 py-3 text-center text-sm font-semibold text-cream"
          >
            Back to Academy
          </Link>
          {showNext ? (
            <button
              onClick={() => router.push(`/academy/${nextSeq.id}`)}
              className="flex-1 rounded-xl border border-brass/50 bg-brass/15 px-4 py-3 text-center text-sm font-semibold text-brass"
            >
              Next lesson ›
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
