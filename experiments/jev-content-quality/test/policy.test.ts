import { test } from "node:test";
import assert from "node:assert/strict";
import { applyThresholdsToResult, derivePolicy, QUESTION_NOUL_IDS } from "../src/policy.js";
import type { EvaluationResult } from "../src/types.js";

const answers = Object.fromEntries(QUESTION_NOUL_IDS.map((id) => [id, { type: "noul" as const, noul: 0.1 }]));
const thresholds = Object.fromEntries(QUESTION_NOUL_IDS.map((id) => [id, 0.8]));

test("policy plumbing derives PASS when every calibrated atomic probability is below threshold", () => {
  assert.equal(derivePolicy(answers, thresholds, QUESTION_NOUL_IDS).decision, "PASS");
});

test("policy plumbing derives REVIEW from one triggered atomic criterion", () => {
  const reviewAnswers = { ...answers, material_technical_error: { type: "noul" as const, noul: 0.95 } };
  const result = derivePolicy(reviewAnswers, thresholds, QUESTION_NOUL_IDS);
  assert.equal(result.decision, "REVIEW");
  assert.deepEqual(result.triggeredCriteria, ["material_technical_error"]);
});

test("policy remains uncalibrated when thresholds are absent", () => {
  assert.equal(derivePolicy(answers, undefined, QUESTION_NOUL_IDS).decision, "UNCALIBRATED");
});

test("an explicitly disabled criterion does not block the calibrated policy", () => {
  const withConflict = { ...answers, answer_explanation_conflict: { type: "noul" as const, noul: 0.99 } };
  const withDisabled = { ...thresholds, answer_explanation_conflict: null };
  assert.equal(derivePolicy(withConflict, withDisabled, QUESTION_NOUL_IDS).decision, "PASS");
});

test("offline thresholds can turn a raw UNCALIBRATED result into a policy result", () => {
  const raw: EvaluationResult = {
    runId: "raw",
    repeatIndex: 0,
    caseId: "case",
    caseGroupId: "group",
    kind: "QUESTION",
    area: "java",
    contentKey: "key",
    instructionLanguage: "ko",
    requestedModel: "jev-1.13.0",
    resolvedModel: "jev-1.13.0",
    rubricVersion: "test",
    datasetVersion: "test",
    rawAnswers: {
      ...answers,
      material_technical_error: { type: "noul", noul: 0.95 },
      difficulty_fit: { type: "choice", choice: "TOO_HARD" },
    },
    derivedPolicyResult: { decision: "UNCALIBRATED", triggeredCriteria: [], missingThresholds: [...QUESTION_NOUL_IDS] },
  };
  const evaluated = applyThresholdsToResult(raw, { ...thresholds, answer_explanation_conflict: null });
  assert.equal(evaluated.derivedPolicyResult.decision, "REVIEW");
  assert.deepEqual(evaluated.derivedPolicyResult.triggeredCriteria, ["material_technical_error"]);
  assert.equal(evaluated.criterionPredictions?.difficulty_fit, undefined);
});

test("difficulty_fit remains diagnostic and cannot create REVIEW", () => {
  const raw: EvaluationResult = {
    runId: "raw-difficulty",
    repeatIndex: 0,
    caseId: "case",
    caseGroupId: "group",
    kind: "QUESTION",
    area: "java",
    contentKey: "key",
    instructionLanguage: "ko",
    requestedModel: "jev-1.13.0",
    rubricVersion: "test",
    datasetVersion: "test",
    rawAnswers: { ...answers, difficulty_fit: { type: "choice", choice: "TOO_HARD" } },
    derivedPolicyResult: { decision: "UNCALIBRATED", triggeredCriteria: [], missingThresholds: [...QUESTION_NOUL_IDS] },
  };
  const evaluated = applyThresholdsToResult(raw, thresholds);
  assert.equal(evaluated.derivedPolicyResult.decision, "PASS");
});
