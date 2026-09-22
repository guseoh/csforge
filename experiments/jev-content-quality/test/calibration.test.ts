import { test } from "node:test";
import assert from "node:assert/strict";
import { calibratePhaseA, selectCandidateThreshold, sweepThresholds } from "../src/calibration.js";
import type { DatasetManifest } from "../src/dataset.js";
import type { CandidateRecord, EvaluationResult } from "../src/types.js";

const source = { sourcePr: 1, repositoryRef: "test", path: "test", beforeRef: "a", afterRef: "b", commit: "b", version: "BEFORE" as const };

function candidate(caseId: string, expected: boolean): CandidateRecord {
  return {
    datasetVersion: "test",
    caseId,
    caseGroupId: `${caseId}-group`,
    kind: "QUESTION",
    area: "java",
    contentKey: caseId,
    source,
    content: { questionType: "DESCRIPTIVE" },
    state: {},
    candidateGoldSeverity: expected ? "P1" : "NONE",
    candidateGold: {
      materialTechnicalError: expected,
      multipleDefensibleAnswers: false,
      answerExplanationConflict: false,
      linkedConceptMisalignment: false,
      responseShapeMismatch: false,
      weakDistractor: null,
      difficultyFit: "APPROPRIATE",
    },
    labelRationale: "test",
  };
}

function rawResult(caseId: string, probability: number): EvaluationResult {
  return {
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
    rubricVersion: "test-rubric",
    datasetVersion: "test",
    rawAnswers: { material_technical_error: { type: "noul", noul: probability } },
    derivedPolicyResult: { decision: "UNCALIBRATED", triggeredCriteria: [], missingThresholds: ["material_technical_error"] },
  };
}

const manifest = {
  datasetVersion: "test",
  rubricVersion: "test-rubric",
  model: "jev-1.13.0",
  datasetKind: "BALANCED_HISTORICAL_DIAGNOSTIC",
  primaryInstructionLanguage: "ko",
  languageExperimentCaseGroups: [],
  estimatedInputCostUsdPerMillionTokens: 0.042,
} as unknown as DatasetManifest;

test("threshold sweep reports TP FP FN TN for every observed boundary", () => {
  const sweep = sweepThresholds([
    { probability: 0.8, expected: true },
    { probability: 0.7, expected: false },
    { probability: 0.6, expected: true },
    { probability: 0.5, expected: false },
  ]);
  assert.deepEqual(sweep.find((point) => point.threshold === 0.6), {
    threshold: 0.6,
    truePositive: 2,
    falsePositive: 1,
    falseNegative: 0,
    trueNegative: 1,
    precision: 2 / 3,
    recall: 1,
  });
});

test("candidate selection chooses the highest full-recall threshold with the fewest false positives", () => {
  const sweep = sweepThresholds([
    { probability: 0.8, expected: true },
    { probability: 0.7, expected: false },
    { probability: 0.6, expected: true },
    { probability: 0.5, expected: false },
  ]);
  assert.equal(selectCandidateThreshold(sweep), 0.6);
  assert.equal(selectCandidateThreshold([
    { threshold: 0.6, truePositive: 2, falsePositive: 1, falseNegative: 0, trueNegative: 1, precision: 2 / 3, recall: 1 },
    { threshold: 0.5, truePositive: 2, falsePositive: 1, falseNegative: 0, trueNegative: 1, precision: 2 / 3, recall: 1 },
  ]), 0.6);
});

test("Phase A calibration leaves unsupported criteria disabled with null thresholds", () => {
  const dataset = [
    candidate("positive-high", true),
    candidate("negative-high", false),
    candidate("positive-low", true),
    candidate("negative-low", false),
  ];
  const results = [
    rawResult("positive-high", 0.8),
    rawResult("negative-high", 0.7),
    rawResult("positive-low", 0.6),
    rawResult("negative-low", 0.5),
  ];
  const calibration = calibratePhaseA(dataset, results, manifest);
  assert.equal(calibration.candidateThresholds.material_technical_error, 0.6);
  assert.equal(calibration.criterionCalibration.answer_explanation_conflict.status, "UNSUPPORTED_IN_PHASE_A");
  assert.equal(calibration.candidateThresholds.answer_explanation_conflict, null);
  assert.equal(calibration.gateMetricsUsingCandidateThresholds.criticalIssueRecall, 1);
});

test("frozen historical holdout cannot be calibrated", () => {
  const holdoutManifest = { ...manifest, datasetKind: "FROZEN_HISTORICAL_HOLDOUT" };
  assert.throws(
    () => calibratePhaseA([candidate("holdout", true)], [rawResult("holdout", 0.8)], holdoutManifest),
    /cannot be used for threshold calibration/,
  );
});
