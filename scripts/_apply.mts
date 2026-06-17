import { readFileSync, writeFileSync } from "node:fs";
import { ALL_LESSONS, BOSSES } from "../src/content/academy/index.ts";

// ---- Recompute the same plan as _rebalance.mts ----
interface Q { loc: string; file: string; choices: string[]; correctIndex: number; }
const qs: Q[] = [];

function fileForId(id: string): string {
  if (id.startsWith("t1-")) return "tier1";
  if (id.startsWith("t2-")) return "tier2";
  if (id.startsWith("t3-")) return "tier3";
  return "tier0";
}

for (const l of ALL_LESSONS) {
  qs.push({ loc: `${l.id}.quiz`, file: fileForId(l.id), choices: l.quiz.choices, correctIndex: l.quiz.correctIndex });
  for (const s of l.steps ?? []) {
    if (s.type === "multiple-choice") {
      qs.push({ loc: `${l.id}.step`, file: fileForId(l.id), choices: (s as any).choices, correctIndex: (s as any).correctIndex });
    }
  }
}
for (const b of BOSSES) {
  b.questions.forEach((q, i) => {
    qs.push({ loc: `${b.id}.q${i}`, file: "boss", choices: q.choices, correctIndex: q.correctIndex });
  });
}

const cycle = [2, 3, 0, 1];
const targets = qs.map((_, i) => cycle[i % cycle.length]);
for (let i = 0; i + 1 < qs.length; i++) {
  const a = qs[i], b = qs[i + 1];
  const aId = a.loc.split(".")[0], bId = b.loc.split(".")[0];
  if (aId === bId && a.loc.endsWith(".quiz") && b.loc.endsWith(".step")) {
    if (JSON.stringify(a.choices) === JSON.stringify(b.choices) && a.correctIndex === b.correctIndex && targets[i] === targets[i + 1]) {
      targets[i + 1] = [2, 3, 0, 1].find((t) => t !== targets[i])!;
    }
  }
}

// ---- Build edits: for each changed question, produce (oldChoicesArray+correctIndex) -> swapped ----
const dir = "src/content/academy/";
const files: Record<string, string> = {};
for (const f of ["tier0", "tier1", "tier2", "tier3", "boss"]) {
  files[f] = readFileSync(dir + f + ".ts", "utf8");
}

function jsArr(items: string[]): string[] {
  // produce candidate string literal forms for an array of strings
  return items.map((s) => JSON.stringify(s));
}

const perFile: Record<string, number> = { tier0: 0, tier1: 0, tier2: 0, tier3: 0, boss: 0 };
const spotChecks: string[] = [];
let applied = 0;

for (let i = 0; i < qs.length; i++) {
  const t = targets[i];
  const q = qs[i];
  if (q.correctIndex === t) continue;

  const swapped = q.choices.slice();
  const tmp = swapped[t];
  swapped[t] = swapped[q.correctIndex];
  swapped[q.correctIndex] = tmp;

  // verify correctness invariant
  if (swapped[t] !== q.choices[q.correctIndex]) throw new Error("swap invariant broken at " + q.loc);

  // Find the choices array text in the file. We search for the exact array of string literals.
  // Build a regex that matches the bracketed list of these literals (order = original),
  // possibly spanning multiple lines, followed (within a small window) by correctIndex: <old>.
  const lit = jsArr(q.choices);
  // Match: [ <lit0> , <lit1> , ... ] with arbitrary whitespace/newlines between.
  const inner = lit.map((l) => escapeRe(l)).join("\\s*,\\s*");
  const arrRe = new RegExp("\\[\\s*" + inner + "\\s*,?\\s*\\]", "g");

  const src = files[q.file];
  const matches = [...src.matchAll(arrRe)];
  if (matches.length === 0) throw new Error("choices array not found for " + q.loc + " :: " + JSON.stringify(q.choices));

  // Among matches, pick the one whose following correctIndex equals old value AND not already processed.
  let chosen: RegExpMatchArray | null = null;
  for (const m of matches) {
    const after = src.slice(m.index!, m.index! + m[0].length + 80);
    const ciM = after.match(/correctIndex:\s*(\d+)/);
    if (ciM && Number(ciM[1]) === q.correctIndex && !(m as any).__used) {
      chosen = m;
      break;
    }
  }
  if (!chosen) throw new Error("no matching choices+correctIndex for " + q.loc);

  // Build replacement: rebuild the array preserving the SAME inline-vs-multiline style is hard;
  // instead, replace just the literal contents in place using a targeted approach:
  // Replace the whole matched array text with a normalized single-line array of swapped literals,
  // BUT to preserve formatting we instead reconstruct using original delimiters.
  // Simplest robust approach: replace matched array block with reordered literals joined by ", ".
  // Detect if original spanned multiple lines.
  const origText = chosen[0];
  const multiline = origText.includes("\n");
  let newArrText: string;
  const swappedLit = jsArr(swapped);
  if (multiline) {
    // figure out indentation of first literal line
    const indentMatch = origText.match(/\n(\s*)/);
    const indent = indentMatch ? indentMatch[1] : "        ";
    newArrText = "[\n" + swappedLit.map((l) => indent + l).join(",\n") + ",\n" + indent.replace(/\s\s$/, "") + "]";
  } else {
    newArrText = "[" + swappedLit.join(", ") + "]";
  }

  // Now also need to update the correctIndex that follows this array.
  // Replace the array text, then within the resulting following window replace correctIndex.
  const start = chosen.index!;
  const end = start + origText.length;
  // find correctIndex occurrence after end
  const afterRegion = src.slice(end, end + 80);
  const ciLocal = afterRegion.match(/correctIndex:\s*\d+/);
  if (!ciLocal) throw new Error("correctIndex not found after array for " + q.loc);
  const ciStart = end + ciLocal.index!;
  const ciEnd = ciStart + ciLocal[0].length;

  const before = src.slice(0, start);
  const between = src.slice(end, ciStart);
  const newCi = `correctIndex: ${t}`;
  const after2 = src.slice(ciEnd);
  files[q.file] = before + newArrText + between + newCi + after2;

  perFile[q.file]++;
  applied++;
  if (spotChecks.length < 3) {
    spotChecks.push(`${q.loc}: from ${q.correctIndex} -> ${t}; correct text "${q.choices[q.correctIndex]}" now at index ${t} (was index ${q.correctIndex}); verify swapped[${t}]==="${swapped[t]}"`);
  }
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

for (const f of ["tier0", "tier1", "tier2", "tier3", "boss"]) {
  writeFileSync(dir + f + ".ts", files[f]);
}

console.log(JSON.stringify({ applied, perFile, spotChecks }, null, 2));
