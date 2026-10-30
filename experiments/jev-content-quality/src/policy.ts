import type { EvaluationResult, JevAnswer, PolicyResult } from "./types.js";

export type PolicyThresholds = Record<string, number | null>;

export const QUESTION_NOUL_IDS = [
  "material_technical_error",
  "multiple_defensible_answers",
  "answer_explanation_conflict",
  "linked_concept_misalignment",
  "response_shape_mismatch",
  "weak_distractor",
] as const;
export const CONCEPT_NOUL_IDS = [
  "material_technical_error",
  "layer_boundary_confusion",
  "learning_objective_gap",
  "causal_or_state_flow_gap",
] as const;

function noulProbability(answer: JevAnswer | undefined): number | undefined {
  return answer?.type === "noul" && typeof answer.noul === "number" ? answer.noul : undefined;
}

function enabledCriterionIds(thresholds: PolicyThresholds, criterionIds: readonly string[]): string[] {
  return criterionIds.filter((id) => typeof thresholds[id] === "number");
}

export function derivePolicy(
  answers: Record<string, JevAnswer>,
  thresholds: PolicyThresholds | undefined,
  requiredNoulIds: readonly string[],
): PolicyResult {
  if (!thresholds) {
    return { decision: "UNCALIBRATED", triggeredCriteria: [], missingThresholds: [...requiredNoulIds], note: "Threshold calibration is required before PASS/REVIEW is interpreted." };
  }

  const missingThresholds = requiredNoulIds.filter((id) => !Object.prototype.hasOwnProperty.call(thresholds, id));
  if (missingThresholds.length > 0) {
    return { decision: "UNCALIBRATED", triggeredCriteria: [], missingThresholds, note: "Every applicable atomic criterion must be enabled with a number or explicitly disabled with null." };
  }

  const enabledIds = enabledCriterionIds(thresholds, requiredNoulIds);
  const triggeredCriteria = enabledIds.filter((id) => {
    const probability = noulProbability(answers[id]);
    return probability !== undefined && probability >= (thresholds[id] as number);
  });
  return {
    decision: triggeredCriteria.length > 0 ? "REVIEW" : "PASS",
    triggeredCriteria,
    missingThresholds: [],
    note: enabledIds.length === 0 ? "All applicable criteria are explicitly disabled for this calibrated evaluation." : undefined,
  };
}

export function criterionPredictions(
  answers: Record<string, JevAnswer>,
  thresholds: PolicyThresholds | undefined,
  criterionIds: readonly string[],
): Record<string, boolean> | undefined {
  if (!thresholds) return undefined;
  const enabledIds = enabledCriterionIds(thresholds, criterionIds);
  return Object.fromEntries(enabledIds.map((id) => {
    const probability = noulProbability(answers[id]);
    return [id, probability !== undefined && probability >= (thresholds[id] as number)];
  }));
}

export function applyThresholdsToResult(result: EvaluationResult, thresholds: PolicyThresholds): EvaluationResult {
  if (result.error || !result.rawAnswers) return result;
  const criterionIds = Object.entries(result.rawAnswers)
    .filter(([, answer]) => answer.type === "noul")
    .map(([id]) => id);
  return {
    ...result,
    criterionPredictions: criterionPredictions(result.rawAnswers, thresholds, criterionIds),
    derivedPolicyResult: derivePolicy(result.rawAnswers, thresholds, criterionIds),
  };
}

export function applyThresholdsToResults(results: EvaluationResult[], thresholds: PolicyThresholds): EvaluationResult[] {
  return results.map((result) => applyThresholdsToResult(result, thresholds));
}
