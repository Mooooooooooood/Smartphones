import { ALL_LESSONS, BOSSES } from "../src/content/academy/index.ts";

const idx: number[] = [];
const correctTexts: string[] = [];
for (const l of ALL_LESSONS) {
  idx.push(l.quiz.correctIndex);
  correctTexts.push(`${l.id}.quiz=${l.quiz.choices[l.quiz.correctIndex]}`);
  for (const s of l.steps ?? []) if (s.type === "multiple-choice") {
    idx.push((s as any).correctIndex);
    correctTexts.push(`${l.id}.step=${(s as any).choices[(s as any).correctIndex]}`);
  }
}
for (const b of BOSSES) for (const q of b.questions) {
  idx.push(q.correctIndex);
  correctTexts.push(`${b.id}=${q.choices[q.correctIndex]}`);
}
const counts = [0, 1, 2, 3].map((i) => idx.filter((x) => x === i).length);
console.log("total", idx.length, "A/B/C/D", counts.join("/"), "max%", (Math.max(...counts) / idx.length * 100).toFixed(1));
console.log("all four used:", counts.every((c) => c > 0), " under 40%:", counts.every((c) => c <= idx.length * 0.4));
