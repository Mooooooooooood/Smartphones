import { ALL_LESSONS, BOSSES } from "../src/content/academy/index.ts";

interface Q {
  loc: string;
  question: string;
  choices: string[];
  correctIndex: number;
}

const qs: Q[] = [];
for (const l of ALL_LESSONS) {
  qs.push({ loc: `${l.id}.quiz`, question: l.quiz.question, choices: l.quiz.choices, correctIndex: l.quiz.correctIndex });
  let si = 0;
  for (const s of l.steps ?? []) {
    if (s.type === "multiple-choice") {
      qs.push({ loc: `${l.id}.step[mc#${si}]`, question: (s as any).prompt, choices: (s as any).choices, correctIndex: (s as any).correctIndex });
      si++;
    }
  }
}
for (const b of BOSSES) {
  b.questions.forEach((q, i) => {
    qs.push({ loc: `${b.id}.q${i}`, question: q.question, choices: q.choices, correctIndex: q.correctIndex });
  });
}

// Round-robin biased toward 2 and 3. Pattern that uses all four but leans C/D.
// Sequence: 2,3,0,1,2,3,2,3,0,1, ... -> use a fixed cycle that overweights 2,3.
const cycle = [2, 3, 0, 1];
const targets = qs.map((_, i) => cycle[i % cycle.length]);

// Handle identical quiz/step pairs: ensure different targets.
// Build map from a normalized key (question text or choices+answer) for lesson quiz vs its step.
// Simpler: detect consecutive pairs where loc is <id>.quiz followed by <id>.step with same choices+correctIndex original.
for (let i = 0; i + 1 < qs.length; i++) {
  const a = qs[i], b = qs[i + 1];
  const aId = a.loc.split(".")[0], bId = b.loc.split(".")[0];
  if (aId === bId && a.loc.endsWith(".quiz") && b.loc.startsWith(`${bId}.step`)) {
    const sameChoices = JSON.stringify(a.choices) === JSON.stringify(b.choices);
    const sameAns = a.correctIndex === b.correctIndex;
    if (sameChoices && sameAns && targets[i] === targets[i + 1]) {
      // bump the step target to a different value, preferring 2/3
      const alt = [2, 3, 0, 1].find((t) => t !== targets[i])!;
      targets[i + 1] = alt;
    }
  }
}

const changes: { loc: string; from: number; to: number; oldText: string; newAtTo: string }[] = [];
for (let i = 0; i < qs.length; i++) {
  const t = targets[i];
  const q = qs[i];
  if (q.correctIndex !== t) {
    changes.push({ loc: q.loc, from: q.correctIndex, to: t, oldText: q.choices[q.correctIndex], newAtTo: q.choices[t] });
  }
}

// compute final distribution
const finalIdx = targets.slice();
const counts = [0, 1, 2, 3].map((i) => finalIdx.filter((x) => x === i).length);
const total = finalIdx.length;

console.log(JSON.stringify({ total, counts, pct: counts.map((c) => (c / total * 100).toFixed(1)), numChanges: changes.length, changes }, null, 2));
