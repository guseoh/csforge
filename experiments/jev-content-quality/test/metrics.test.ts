import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateMetrics } from "../src/metrics.js";
import type { CandidateRecord, EvaluationResult } from "../src/types.js";

const source = { sourcePr: 1, repositoryRef: "test", path: "test", beforeRef: "a", afterRef: "b", commit: "b", version: "BEFORE" as const };
const candidate = (caseId: string, severity: "P1" | "NONE", flag: boolean): CandidateRecord => ({
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
  candidateGold: { materialTechnicalError: flag, multipleDefensibleAnswers: false, answerExplanationConflict: false, linkedConceptMisalignment: false, responseShapeMismatch: false, weakDistractor: null, difficultyFit: "APPROPRIATE" },
  labelRationale: "test",
});

const result = (caseId: string, review: "PASS" | "REVIEW", prediction: boolean, latencyMs: number, inputTokens: number): EvaluationResult => ({
  runId: caseId,
  repeatIndex: 0,
  caseId,
  caseGroupId: `${caseId}-group`,
  kind: "QUESTION",
  area: "java",
  contentKey: caseId,
  questionType: "DESCRIPTIVE",
  instructionLanguage: "ko",
  requestedModel: "jev-1.13.0",
  resolvedModel: "jev-1.13.0",
  rubricVersion: "test",
  datasetVersion: "test",
  latencyMs,
  inputTokens,
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
