import type { CandidateRecord } from "./types.js";

export const GOLD_KEY_BY_RUBRIC_ID: Record<string, string> = {
  material_technical_error: "materialTechnicalError",
  multiple_defensible_answers: "multipleDefensibleAnswers",
  answer_explanation_conflict: "answerExplanationConflict",
  linked_concept_misalignment: "linkedConceptMisalignment",
  response_shape_mismatch: "responseShapeMismatch",
  weak_distractor: "weakDistractor",
  layer_boundary_confusion: "layerBoundaryConfusion",
  learning_objective_gap: "learningObjectiveGap",
  causal_or_state_flow_gap: "causalOrStateFlowGap",
};

export function criterionGold(candidate: CandidateRecord, criterionId: string): boolean | undefined {
  const key = GOLD_KEY_BY_RUBRIC_ID[criterionId];
  if (!key) return undefined;
  const value = (candidate.candidateGold as unknown as Record<string, unknown>)[key];
  return typeof value === "boolean" ? value : undefined;
}
