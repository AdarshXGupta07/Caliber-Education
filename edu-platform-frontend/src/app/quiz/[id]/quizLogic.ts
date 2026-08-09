// Pure data types + functions for the quiz attempt flow, kept out of page.tsx
// deliberately — Next.js route files may only export a fixed set of known
// names (default, metadata, generateStaticParams, ...), so any other named
// export (like a plain helper function) fails the App Router's route typing.
// This module has no such restriction and is what page.tsx and the test
// suite both import from.

// -- Models matching Backend V3 Schema --
export interface Question {
  id: string;
  type: "normal" | "case";
  text: string;
  options: string[];
  // Not present until after submission — the quiz-taking endpoint never
  // returns the answer key. Populated from the submit-v2 response instead.
  correctOptionIndex?: number;
  explanation?: string;
  marks: number;
  negativeMarks: number;
  difficulty: "easy" | "medium" | "hard";
  case_narrative?: string;
  case_group_id?: string;
}

export interface CaseScenario {
  id: string;
  narrative: string;
}

export interface ExamSection {
  id: string;
  title: string;
  questions: Question[];
}

export interface MCQPaper {
  id: string;
  title: string;
  level: string;
  groupName: string;
  subjectCode: string;
  chapterName?: string;
  testType: string;
  durationMinutes: number;
  passingMarks: number;
  totalMarks: number;
  status: "draft" | "published" | "archived";
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  sections: ExamSection[];
  case_scenarios?: CaseScenario[];
}

export type FlatEntry = {
  sectionId: string;
  sectionTitle: string;
  question: Question;
};

export function flattenPaperQuestions(paper: MCQPaper): FlatEntry[] {
  const result: FlatEntry[] = [];
  if (!paper.sections) return result;

  for (const sec of paper.sections) {
    if (!sec.questions) continue;
    for (const q of sec.questions) {
      result.push({
        sectionId: sec.id,
        sectionTitle: sec.title,
        question: q
      });
    }
  }
  return result;
}

// Shuffles standalone normal-MCQ entries among themselves. Case-study
// sub-questions are grouped into contiguous blocks by their shared
// case_group_id (falling back to case_narrative equality only when
// case_group_id is missing, e.g. data saved before that column existed) that
// keep both their internal order and their original position slot in the
// sequence — a case's questions never get split up or mixed with others.
// An ID-based key can't accidentally merge two distinct blocks that happen
// to share empty/identical narrative text, unlike a text-only comparison.
export function shuffleFlatQuestions(entries: FlatEntry[]): FlatEntry[] {
  type Block =
    | { kind: "case"; entries: FlatEntry[] }
    | { kind: "normal"; entry: FlatEntry };

  const caseKeyOf = (e: FlatEntry) => e.question.case_group_id || e.question.case_narrative;

  const blocks: Block[] = [];
  let i = 0;
  while (i < entries.length) {
    const e = entries[i];
    if (e.question.type === "case") {
      const caseKey = caseKeyOf(e);
      const group: FlatEntry[] = [e];
      let j = i + 1;
      while (
        j < entries.length &&
        entries[j].question.type === "case" &&
        caseKeyOf(entries[j]) === caseKey
      ) {
        group.push(entries[j]);
        j++;
      }
      blocks.push({ kind: "case", entries: group });
      i = j;
    } else {
      blocks.push({ kind: "normal", entry: e });
      i++;
    }
  }

  const normalBlockIndices = blocks
    .map((b, idx) => (b.kind === "normal" ? idx : -1))
    .filter((idx) => idx !== -1);
  const normalEntries = normalBlockIndices.map(
    (idx) => (blocks[idx] as { kind: "normal"; entry: FlatEntry }).entry
  );
  for (let k = normalEntries.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [normalEntries[k], normalEntries[j]] = [normalEntries[j], normalEntries[k]];
  }
  normalBlockIndices.forEach((blockIdx, k) => {
    blocks[blockIdx] = { kind: "normal", entry: normalEntries[k] };
  });

  const result: FlatEntry[] = [];
  for (const b of blocks) {
    if (b.kind === "case") result.push(...b.entries);
    else result.push(b.entry);
  }
  return result;
}

// Computes the display order to send to /attempt/start — same logic used
// both for a brand-new attempt and for starting a fresh one after "Practice
// Again", so there is exactly one place this decision is made.
export function computeQuestionOrder(paper: MCQPaper): string[] {
  const base = flattenPaperQuestions(paper);
  const ordered = paper.shuffleQuestions ? shuffleFlatQuestions(base) : base;
  return ordered.map((e) => e.question.id);
}

// Reorders `base` (the paper's natural, unshuffled question list) to match a
// server-persisted display order — the backend never recomputes the shuffle
// itself (that algorithm lives only here, in one place), it just remembers
// and replays whichever order a client already computed at attempt start.
// Any ID no longer present in `base` (e.g. a question removed from the paper
// mid-attempt) is silently skipped; any entry in `base` not present in
// `orderedIds` (e.g. a question added mid-attempt) is appended at the end,
// so nothing already fetched is ever dropped.
export function reorderFlatQuestionsById(base: FlatEntry[], orderedIds: string[]): FlatEntry[] {
  const byId = new Map(base.map((e) => [e.question.id, e]));
  const result: FlatEntry[] = [];
  const seen = new Set<string>();
  for (const id of orderedIds) {
    const entry = byId.get(id);
    if (entry && !seen.has(id)) {
      result.push(entry);
      seen.add(id);
    }
  }
  for (const e of base) {
    if (!seen.has(e.question.id)) result.push(e);
  }
  return result;
}
