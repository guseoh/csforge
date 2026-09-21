import { test } from "node:test";
import assert from "node:assert/strict";
import { runBenchmark } from "../src/runner.js";
import type { TypeSafeDirectClient } from "../src/client.js";
import type { CandidateRecord, JevAnswer, RubricQuestion } from "../src/types.js";

const candidate: CandidateRecord = {
  datasetVersion: "test",
  caseId: "case-before",
  caseGroupId: "case",
  kind: "QUESTION",
  area: "java",
  contentKey: "java.test",
  source: { sourcePr: 1, repositoryRef: "test", path: "test", beforeRef: "a", afterRef: "b", commit: "b", version: "BEFORE" },
  content: { questionType: "DESCRIPTIVE" },
  state: { content: {} },
  candidateGoldSeverity: "NONE",
  candidateGold: {
    materialTechnicalError: false,
    multipleDefensibleAnswers: false,
    answerExplanationConflict: false,
    linkedConceptMisalignment: false,
    responseShapeMismatch: false,
    weakDistractor: null,
    difficultyFit: "APPROPRIATE",
  },
  labelRationale: "test",
};

const client = {
  async evaluate(_state: Record<string, unknown>, questions: Record<string, RubricQuestion>) {
    const answers: Record<string, JevAnswer> = {};
    for (const [id, question] of Object.entries(questions)) {
      if (question.type === "noul") answers[id] = { type: "noul", noul: 0.1 };
      else answers[id] = { type: "choice", choice: "APPROPRIATE", probabilities: { TOO_EASY: 0.1, APPROPRIATE: 0.8, TOO_HARD: 0.1 }, confidence: 0.8 };
    }
    return { response: { model: "jev-1.13.0", answers }, latencyMs: 1 };
  },
} as unknown as TypeSafeDirectClient;

test("benchmark runner stores raw answers and never applies policy thresholds", async () => {
  const [result] = await runBenchmark({
    dataset: [candidate],
    client,
    requestedModel: "jev-1.13.0",
    datasetVersion: "test",
  });
  assert.ok(result.rawAnswers);
  assert.equal(result.derivedPolicyResult.decision, "UNCALIBRATED");
  assert.equal(result.criterionPredictions, undefined);
});
