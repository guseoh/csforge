import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateMetrics } from "../src/metrics.js";
import { assertThresholdedMetricsAllowed } from "../src/dataset.js";
import type { CandidateRecord, DifficultyFit, EvaluationResult, InstructionLanguage } from "../src/types.js";

const source = { sourcePr: 1, repositoryRef: "test", path: "test", beforeRef: "a", afterRef: "b", commit: "b", version: "BEFORE" as const };
const candidate = (caseId: string, severity: "P1" | "P2" | "NONE", flag: boolean, difficultyFit: DifficultyFit = "APPROPRIATE"): CandidateRecord => ({
  datasetVersion: "test",
  caseId,
  caseGroupId: `${caseId}-group`,
  kind: "QUESTION",
  area: "java",
  contentKey: caseId,
  source,
  content: { questionType: "DESCRIPTIVE" },
  state: {},
  candidateGoldSeverity: severity,
  candidateGold: { materialTechnicalError: flag, multipleDefensibleAnswers: false, answerExplanationConflict: false, linkedConceptMisalignment: false, responseShapeMismatch: false, weakDistractor: null, difficultyFit },
  labelRationale: "test",
});

const result = (caseId: string, review: "PASS" | "REVIEW", prediction: boolean, latencyMs: number, inputTokens: number, difficultyChoice?: DifficultyFit, instructionLanguage: InstructionLanguage = "ko"): EvaluationResult => ({
  runId: caseId,
  repeatIndex: 0,
  caseId,
  caseGroupId: `${caseId}-group`,
  kind: "QUESTION",
  area: "java",
  contentKey: caseId,
  questionType: "DESCRIPTIVE",
  instructionLanguage,
  requestedModel: "jev-1.13.0",
  resolvedModel: "jev-1.13.0",
  rubricVersion: "test",
  datasetVersion: "test",
  latencyMs,
  inputTokens,
  rawAnswers: difficultyChoice ? { difficulty_fit: { type: "choice", choice: difficultyChoice } } : undefined,
  criterionPredictions: { material_technical_error: prediction },
  derivedPolicyResult: { decision: review, triggeredCriteria: [], missingThresholds: [] },
});

test("metrics calculate criterion confusion and latency percentiles", () => {
  const dataset = [candidate("critical", "P1", true), candidate("clean", "NONE", false)];
  const results = [result("critical", "REVIEW", true, 10, 100), result("clean", "PASS", false, 20, 200)];
  const metrics = calculateMetrics(dataset, results, { inputCostUsdPerMillionTokens: 0.042, balancedHistoricalSet: true });
  assert.equal(metrics.criterion.material_technical_error.recall, 1);
  assert.equal(metrics.criterion.material_technical_error.precision, 1);
  assert.equal(metrics.latencyMs.p50, 10);
  assert.equal(metrics.latencyMs.p95, 20);
  assert.equal(metrics.humanReviewReductionRate, null);
  assert.ok(Math.abs(metrics.estimatedCostUsd - 0.0000126) < 1e-12);
});

test("metrics use P2 plus NONE for FPR and report difficulty confusion separately", () => {
  const dataset = [
    candidate("critical", "P1", true),
    candidate("p2", "P2", false, "TOO_HARD"),
    candidate("clean", "NONE", false, "TOO_EASY"),
  ];
  const results = [
    result("critical", "REVIEW", true, 10, 100, "APPROPRIATE"),
    result("p2", "REVIEW", false, 20, 100, "TOO_HARD"),
    result("clean", "PASS", false, 30, 100, "TOO_HARD"),
  ];
  const metrics = calculateMetrics(dataset, results, { inputCostUsdPerMillionTokens: 0.042 });
  assert.equal(metrics.falsePositiveRate, 0.5);
  assert.equal(metrics.humanReviewReductionRate, 1 / 3);
  assert.equal(metrics.difficultyFit.count, 3);
  assert.equal(metrics.difficultyFit.accuracy, 2 / 3);
  assert.equal(metrics.difficultyFit.confusionMatrix.TOO_EASY.TOO_HARD, 1);
  assert.equal(metrics.difficultyFit.confusionMatrix.TOO_HARD.TOO_HARD, 1);
});

test("metrics exclude invalid and uncalibrated results from quality denominators", () => {
  const dataset = [candidate("critical", "P1", true), candidate("clean", "NONE", false)];
  const invalid: EvaluationResult = {
    ...result("clean", "PASS", false, 20, 200),
    criterionPredictions: undefined,
    derivedPolicyResult: { decision: "UNCALIBRATED", triggeredCriteria: [], missingThresholds: [] },
    error: { kind: "INVALID_RESPONSE", message: "malformed" },
  };
  const metrics = calculateMetrics(dataset, [result("critical", "REVIEW", true, 10, 100), invalid], { inputCostUsdPerMillionTokens: 0.042 });
  assert.equal(metrics.successfulPolicyEvaluationCount, 1);
  assert.equal(metrics.criticalIssueRecall, 1);
  assert.equal(metrics.falsePositiveRate, null);
  assert.equal(metrics.invalidResponseCount, 1);
  assert.equal(metrics.uncalibratedCount, 1);
});

test("overall quality uses ko once while language comparison uses only paired experiment cases", () => {
  const dataset = [
    candidate("critical", "P1", true),
    candidate("clean", "NONE", false),
    candidate("outside", "NONE", false),
  ];
  const results = [
    result("critical", "REVIEW", true, 10, 100, "APPROPRIATE", "ko"),
    result("critical", "PASS", false, 11, 100, "APPROPRIATE", "en"),
    result("clean", "PASS", false, 12, 100, "APPROPRIATE", "ko"),
    result("clean", "REVIEW", true, 13, 100, "APPROPRIATE", "en"),
    result("outside", "PASS", false, 14, 100, "APPROPRIATE", "ko"),
    result("outside", "REVIEW", true, 15, 100, "APPROPRIATE", "en"),
  ];
  const metrics = calculateMetrics(dataset, results, {
    inputCostUsdPerMillionTokens: 0.042,
    primaryInstructionLanguage: "ko",
    languageExperimentCaseGroups: new Set(["critical-group", "clean-group"]),
  });

  assert.equal(metrics.successfulPolicyEvaluationCount, 3);
  assert.equal(metrics.criticalIssueRecall, 1);
  assert.equal(metrics.falsePositiveRate, 0);
  assert.equal(metrics.inputTokens.total, 600);
  assert.equal(metrics.languageComparison.pairedCaseCount, 2);
  assert.equal(metrics.languageComparison.ko.criticalIssueRecall, 1);
  assert.equal(metrics.languageComparison.ko.falsePositiveRate, 0);
  assert.equal(metrics.languageComparison.en.criticalIssueRecall, 0);
  assert.equal(metrics.languageComparison.en.falsePositiveRate, 1);
  assert.equal(metrics.languageComparison.pairedDecisions.koReviewEnPass, 1);
  assert.equal(metrics.languageComparison.pairedDecisions.koPassEnReview, 1);
});

test("critical issue false-negative rate is distinct from atomic criterion FNR", () => {
  const dataset = [candidate("critical", "P1", true), candidate("clean", "NONE", false)];
  const metrics = calculateMetrics(dataset, [
    result("critical", "PASS", false, 10, 100),
    result("clean", "PASS", false, 20, 100),
  ]);
  assert.equal(metrics.criticalIssueRecall, 0);
  assert.equal(metrics.criticalIssueFalseNegativeRate, 1);
  assert.equal(metrics.criterionFalseNegativeRate, 1);
});

test("frozen weak-distractor holdout rejects thresholded metrics", () => {
  assert.throws(
    () => assertThresholdedMetricsAllowed("FROZEN_WEAK_DISTRACTOR_HOLDOUT", true),
    /thresholds are not allowed/,
  );
  assert.doesNotThrow(() => assertThresholdedMetricsAllowed("FROZEN_WEAK_DISTRACTOR_HOLDOUT", false));
});
