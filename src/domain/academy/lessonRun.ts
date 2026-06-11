import type { Lesson } from "@/content/academy";
import type { LessonStep } from "./lessonSteps";

/**
 * Effective step sequence for a lesson. Tier 0 lessons author their own
 * interactive steps; older (Tier 1) lessons are adapted into a default
 * intro → demo/explain → checkpoint flow so the screen is uniformly step-driven.
 */
export function lessonSteps(lesson: Lesson): LessonStep[] {
  if (lesson.steps && lesson.steps.length) return lesson.steps;

  const guide = lesson.guide ?? "bishop";
  const steps: LessonStep[] = [
    { type: "intro", guide, title: lesson.title, text: lesson.subtitle },
  ];

  if (lesson.fen) {
    steps.push({
      type: "board-demo",
      fen: lesson.fen,
      prompt: lesson.explanation,
      caption: lesson.boardCaption,
      guide,
    });
  } else {
    steps.push({
      type: "explain",
      title: "The idea",
      text: lesson.explanation,
      points: lesson.keyPoints,
      guide,
    });
  }

  steps.push({
    type: "multiple-choice",
    prompt: lesson.quiz.question,
    choices: lesson.quiz.choices,
    correctIndex: lesson.quiz.correctIndex,
    guide,
  });

  return steps;
}
