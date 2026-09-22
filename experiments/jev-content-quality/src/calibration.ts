import { FROZEN_HISTORICAL_HOLDOUT, type DatasetManifest } from "./dataset.js";
import { criterionGold } from "./gold.js";
import { calculateMetrics, type EvaluationMetrics } from "./metrics.js";
import { applyThresholdsToResults, CONCEPT_NOUL_IDS, QUESTION_NOUL_IDS, type PolicyThresholds } from "./policy.js";
import type { CandidateRecord, EvaluationResult, InstructionLanguage } from "./types.js";

export interface ThresholdSweepPoint {
  threshold: number;
  truePositive: number;
  falsePositive: number;
  falseNegative: number;
  trueNegative: number;
  precision: number | null;
  recall: number | null;
}

export interface CriterionCalibration {
  status: "CANDIDATE_PHASE_A" | "UNSUPPORTED_IN_PHASE_A" | "NO_VALID_OBSERVATIONS";
  positiveSupport: number;
  observationCount: number;
  candidateThreshold: number | null;
  sweep: ThresholdSweepPoint[];
}

export interface CalibrationResult {
  datasetVersion: string;
  model: string;
  rubricVersion: string;
  primaryInstructionLanguage: InstructionLanguage;
  criterionCalibration: Record<string, CriterionCalibration>;
  supportedCriteria: string[];
  unsupportedCriteria: string[];
  unavailableSupportedCriteria: string[];
  candidateThresholds: PolicyThresholds;
  gateMetricsUsingCandidateThresholds: EvaluationMetrics;
  warning: string;
}

export interface Observation {
  probability: number;
  expected: boolean;
}

export const ALL_NOUL_CRITERION_IDS = [...new Set([...QUESTION_NOUL_IDS, ...CONCEPT_NOUL_IDS])];

function rate(numerator: number, denominator: number): number | null {
  return denominator === 0 ? null : numerator / denominator;
}

export function sweepThresholds(observations: Observation[]): ThresholdSweepPoint[] {
  const thresholds = [...new Set(observations.map((observation) => observation.probability))].sort((a, b) => b - a);
  return thresholds.map((threshold) => {
    let truePositive = 0;
    let falsePositive = 0;
    let falseNegative = 0;
    let trueNegative = 0;
    for (const observation of observations) {
      const prediction = observation.probability >= threshold;
      if (prediction && observation.expected) truePositive += 1;
      else if (prediction && !observation.expected) falsePositive += 1;
      else if (!prediction && observation.expected) falseNegative += 1;
      else trueNegative += 1;
    }
    return {
      threshold,
      truePositive,
      falsePositive,
      falseNegative,
      trueNegative,
      precision: rate(truePositive, truePositive + falsePositive),
      recall: rate(truePositive, truePositive + falseNegative),
    };
  });
}

export function selectCandidateThreshold(points: ThresholdSweepPoint[]): number | null {
  const fullRecall = points.filter((point) => point.falseNegative === 0 && point.truePositive > 0);
  if (fullRecall.length === 0) return null;
  return [...fullRecall].sort((left, right) =>
    left.falsePositive - right.falsePositive
    || right.threshold - left.threshold
  )[0].threshold;
}

function collectObservations(
  dataset: CandidateRecord[],
  results: EvaluationResult[],
  criterionId: string,
  primaryInstructionLanguage: InstructionLanguage,
): Observation[] {
  const byCaseId = new Map(dataset.map((candidate) => [candidate.caseId, candidate]));
  const observations: Observation[] = [];
  for (const result of results) {
    if (result.instructionLanguage !== primaryInstructionLanguage || result.error) continue;
    const candidate = byCaseId.get(result.caseId);
    const expected = candidate ? criterionGold(candidate, criterionId) : undefined;
    const answer = result.rawAnswers?.[criterionId];
    if (expected === undefined || answer?.type !== "noul" || typeof answer.noul !== "number") continue;
    observations.push({ probability: answer.noul, expected });
  }
  return observations;
}

export function calibratePhaseA(
  dataset: CandidateRecord[],
  rawResults: EvaluationResult[],
  manifest: DatasetManifest,
): CalibrationResult {
  if (manifest.datasetKind === FROZEN_HISTORICAL_HOLDOUT
    || rawResults.some((result) => result.datasetKind === FROZEN_HISTORICAL_HOLDOUT)) {
    throw new Error("FROZEN_HISTORICAL_HOLDOUT cannot be used for threshold calibration");
  }
  if (rawResults.some((result) => result.datasetVersion !== manifest.datasetVersion)) {
    throw new Error("Calibration results must match the Phase A calibration dataset version");
  }
  const primaryInstructionLanguage = manifest.primaryInstructionLanguage ?? "ko";
  const criterionCalibration: Record<string, CriterionCalibration> = {};
  const candidateThresholds: PolicyThresholds = {};
  const supportedCriteria: string[] = [];
  const unsupportedCriteria: string[] = [];
  const unavailableSupportedCriteria: string[] = [];

  for (const criterionId of ALL_NOUL_CRITERION_IDS) {
    const observations = collectObservations(dataset, rawResults, criterionId, primaryInstructionLanguage);
    const positiveSupport = dataset.filter((candidate) => criterionGold(candidate, criterionId) === true).length;
    const sweep = sweepThresholds(observations);
    if (positiveSupport === 0) {
      criterionCalibration[criterionId] = {
        status: "UNSUPPORTED_IN_PHASE_A",
        positiveSupport,
        observationCount: observations.length,
        candidateThreshold: null,
        sweep,
      };
      candidateThresholds[criterionId] = null;
      unsupportedCriteria.push(criterionId);
      continue;
    }

    const candidateThreshold = selectCandidateThreshold(sweep);
    const status = candidateThreshold === null ? "NO_VALID_OBSERVATIONS" : "CANDIDATE_PHASE_A";
    criterionCalibration[criterionId] = {
      status,
      positiveSupport,
      observationCount: observations.length,
      candidateThreshold,
      sweep,
    };
    candidateThresholds[criterionId] = candidateThreshold;
    supportedCriteria.push(criterionId);
    if (candidateThreshold === null) unavailableSupportedCriteria.push(criterionId);
  }

  const evaluatedResults = applyThresholdsToResults(rawResults, candidateThresholds);
  return {
    datasetVersion: manifest.datasetVersion,
    model: rawResults.find((result) => result.resolvedModel)?.resolvedModel ?? manifest.model,
    rubricVersion: manifest.rubricVersion,
    primaryInstructionLanguage,
    criterionCalibration,
    supportedCriteria,
    unsupportedCriteria,
    unavailableSupportedCriteria,
    candidateThresholds,
    gateMetricsUsingCandidateThresholds: calculateMetrics(dataset, evaluatedResults, {
      inputCostUsdPerMillionTokens: manifest.estimatedInputCostUsdPerMillionTokens,
      balancedHistoricalSet: manifest.datasetKind === "BALANCED_HISTORICAL_DIAGNOSTIC",
      primaryInstructionLanguage,
      languageExperimentCaseGroups: new Set(manifest.languageExperimentCaseGroups),
    }),
    warning: "Phase A is calibration/diagnostic data. Candidate thresholds selected and evaluated on the same small historical set are not production thresholds or generalization estimates.",
  };
}
