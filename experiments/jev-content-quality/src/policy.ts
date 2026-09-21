import type { JevAnswer, PolicyResult } from "./types.js";

export type PolicyThresholds = Record<string, number>;

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

export function derivePolicy(
  answers: Record<string, JevAnswer>,
  thresholds: PolicyThresholds | undefined,
  requiredNoulIds: readonly string[],
): PolicyResult {
  if (!thresholds) {
    return { decision: "UNCALIBRATED", triggeredCriteria: [], missingThresholds: [...requiredNoulIds], note: "Threshold calibration is required before PASS/REVIEW is interpreted." };
  }

  const missingThresholds = requiredNoulIds.filter((id) => typeof thresholds[id] !== "number");
  if (missingThresholds.length > 0) {
    return { decision: "UNCALIBRATED", triggeredCriteria: [], missingThresholds, note: "Not all atomic criteria have calibrated thresholds." };
  }

  const triggeredCriteria = requiredNoulIds.filter((id) => {
    const probability = noulProbability(answers[id]);
    return probability !== undefined && probability >= thresholds[id];
  });
  return {
    decision: triggeredCriteria.length > 0 ? "REVIEW" : "PASS",
    triggeredCriteria,
    missingThresholds: [],
  };
}

export function criterionPredictions(
  answers: Record<string, JevAnswer>,
  thresholds: PolicyThresholds | undefined,
  criterionIds: readonly string[],
): Record<string, boolean> {
  return Object.fromEntries(
    criterionIds.map((id) => {
      const probability = noulProbability(answers[id]);
      return [id, probability !== undefined && thresholds?.[id] !== undefined && probability >= thresholds[id]];
    }),
  );
}
