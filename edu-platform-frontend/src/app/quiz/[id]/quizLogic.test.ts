import { describe, expect, it } from "vitest";
import {
  flattenPaperQuestions,
  shuffleFlatQuestions,
  reorderFlatQuestionsById,
  type MCQPaper,
  type Question,
} from "./quizLogic";

function q(overrides: Partial<Question> & { id: string }): Question {
  return {
    type: "normal",
    text: `Question ${overrides.id}`,
    options: ["a", "b", "c", "d"],
    marks: 1,
    negativeMarks: 0,
    difficulty: "medium",
    ...overrides,
  };
}

describe("flattenPaperQuestions", () => {
  it("flattens sections in order and attaches section metadata", () => {
    const paper: MCQPaper = {
      id: "p1", title: "T", level: "FINAL", groupName: "GROUP_1", subjectCode: "FR",
      testType: "FULL_SUBJECT", durationMinutes: 60, passingMarks: 40, totalMarks: 10,
      status: "published", shuffleQuestions: false, shuffleOptions: false,
      sections: [
        { id: "secA", title: "Section A", questions: [q({ id: "q1" }), q({ id: "q2" })] },
        { id: "secB", title: "Section B", questions: [q({ id: "q3" })] },
      ],
    };

    const flat = flattenPaperQuestions(paper);
    expect(flat.map((e) => e.question.id)).toEqual(["q1", "q2", "q3"]);
    expect(flat.map((e) => e.sectionId)).toEqual(["secA", "secA", "secB"]);
  });

  it("returns an empty array when the paper has no sections", () => {
    const paper = { id: "p1", sections: [] } as unknown as MCQPaper;
    expect(flattenPaperQuestions(paper)).toEqual([]);
  });
});

describe("shuffleFlatQuestions", () => {
  const CASE_GROUP = "case-group-1";

  function buildEntries() {
    return flattenPaperQuestions({
      id: "p1", title: "T", level: "FINAL", groupName: "GROUP_1", subjectCode: "FR",
      testType: "FULL_SUBJECT", durationMinutes: 60, passingMarks: 40, totalMarks: 10,
      status: "published", shuffleQuestions: true, shuffleOptions: false,
      sections: [
        {
          id: "secA", title: "Section A", questions: [
            q({ id: "n1" }),
            q({ id: "c1", type: "case", case_narrative: "Narrative", case_group_id: CASE_GROUP }),
            q({ id: "c2", type: "case", case_narrative: "Narrative", case_group_id: CASE_GROUP }),
            q({ id: "c3", type: "case", case_narrative: "Narrative", case_group_id: CASE_GROUP }),
            q({ id: "n2" }),
            q({ id: "n3" }),
            q({ id: "n4" }),
          ],
        },
      ],
    });
  }

  it("never splits or reorders a case cluster's internal questions, across many shuffles", () => {
    for (let trial = 0; trial < 50; trial++) {
      const shuffled = shuffleFlatQuestions(buildEntries());
      const ids = shuffled.map((e) => e.question.id);

      // Same set of questions, no loss or duplication.
      expect(new Set(ids)).toEqual(new Set(["n1", "n2", "n3", "n4", "c1", "c2", "c3"]));

      // The case cluster stays contiguous...
      const caseIndices = ids
        .map((id, i) => (id.startsWith("c") ? i : -1))
        .filter((i) => i !== -1);
      expect(caseIndices).toEqual([caseIndices[0], caseIndices[0] + 1, caseIndices[0] + 2]);

      // ...and keeps its authored internal order (c1, c2, c3), never shuffled.
      expect(ids.slice(caseIndices[0], caseIndices[0] + 3)).toEqual(["c1", "c2", "c3"]);
    }
  });

  it("actually shuffles the normal questions across trials (not a no-op)", () => {
    const orders = new Set<string>();
    for (let trial = 0; trial < 30; trial++) {
      const ids = shuffleFlatQuestions(buildEntries()).map((e) => e.question.id);
      orders.add(ids.filter((id) => id.startsWith("n")).join(","));
    }
    // Astronomically unlikely to collapse to a single order across 30 trials
    // of a real Fisher-Yates shuffle over 4 elements unless shuffling broke.
    expect(orders.size).toBeGreaterThan(1);
  });

  it("keeps two distinct case blocks separate even when narrative text collides", () => {
    const entries = flattenPaperQuestions({
      id: "p1", title: "T", level: "FINAL", groupName: "GROUP_1", subjectCode: "FR",
      testType: "FULL_SUBJECT", durationMinutes: 60, passingMarks: 40, totalMarks: 10,
      status: "published", shuffleQuestions: true, shuffleOptions: false,
      sections: [
        {
          id: "secA", title: "Section A", questions: [
            q({ id: "a1", type: "case", case_narrative: "Same text", case_group_id: "group-a" }),
            q({ id: "a2", type: "case", case_narrative: "Same text", case_group_id: "group-a" }),
            q({ id: "b1", type: "case", case_narrative: "Same text", case_group_id: "group-b" }),
            q({ id: "b2", type: "case", case_narrative: "Same text", case_group_id: "group-b" }),
          ],
        },
      ],
    });

    for (let trial = 0; trial < 20; trial++) {
      const ids = shuffleFlatQuestions(entries).map((e) => e.question.id);
      // group-a's two questions and group-b's two questions must each stay
      // adjacent to each other, never interleaved (a1,b1,a2,b2 would be a bug).
      const aGap = Math.abs(ids.indexOf("a1") - ids.indexOf("a2"));
      const bGap = Math.abs(ids.indexOf("b1") - ids.indexOf("b2"));
      expect(aGap).toBe(1);
      expect(bGap).toBe(1);
    }
  });
});

describe("reorderFlatQuestionsById", () => {
  const paper: MCQPaper = {
    id: "p1", title: "T", level: "FINAL", groupName: "GROUP_1", subjectCode: "FR",
    testType: "FULL_SUBJECT", durationMinutes: 60, passingMarks: 40, totalMarks: 10,
    status: "published", shuffleQuestions: false, shuffleOptions: false,
    sections: [
      { id: "secA", title: "Section A", questions: [q({ id: "q1" }), q({ id: "q2" })] },
      { id: "secB", title: "Section B", questions: [q({ id: "q3" })] },
    ],
  };

  it("reorders to match a server-persisted id order, regardless of the paper's natural section order", () => {
    const base = flattenPaperQuestions(paper);
    const reordered = reorderFlatQuestionsById(base, ["q3", "q1", "q2"]);
    expect(reordered.map((e) => e.question.id)).toEqual(["q3", "q1", "q2"]);
    // Section metadata travels with each entry, not recomputed.
    expect(reordered[0].sectionId).toBe("secB");
  });

  it("ignores an id in the order that no longer exists in the base set (e.g. a question removed from the paper mid-attempt)", () => {
    const base = flattenPaperQuestions(paper);
    const reordered = reorderFlatQuestionsById(base, ["q2", "ghost-question", "q1"]);
    // "ghost-question" is skipped; q3 (a real base entry with no persisted
    // position) is still appended at the end rather than silently dropped.
    expect(reordered.map((e) => e.question.id)).toEqual(["q2", "q1", "q3"]);
  });

  it("appends base entries not present in the given order, without dropping them", () => {
    const base = flattenPaperQuestions(paper);
    // Only q2 has a persisted position — q1 and q3 were added to the paper
    // after this attempt's order was captured.
    const reordered = reorderFlatQuestionsById(base, ["q2"]);
    expect(reordered.map((e) => e.question.id)).toEqual(["q2", "q1", "q3"]);
  });

  it("returns every base entry unchanged when given an empty order", () => {
    const base = flattenPaperQuestions(paper);
    const reordered = reorderFlatQuestionsById(base, []);
    expect(reordered.map((e) => e.question.id)).toEqual(["q1", "q2", "q3"]);
  });
});
