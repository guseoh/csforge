import type { CandidateRecord, EvaluationResult } from "./types.js";

export interface ConfusionMetric {
  truePositive: number;
  falsePositive: number;
  falseNegative: number;
  trueNegative: number;
  precision: number | null;
  recall: number | null;
}

export interface EvaluationMetrics {
  criterion: Record<string, ConfusionMetric>;
  criticalIssueRecall: number | null;
  falseNegativeRate: number | null;
  falsePositiveRate: number | null;
  humanReviewReductionRate: number | null;
  areaBreakdown: Record<string, { count: number; reviewCount: number }>;
  kindBreakdown: Record<string, { count: number; reviewCount: number }>;
  questionTypeBreakdown: Record<string, { count: number; reviewCount: number }>;
  instructionLanguageBreakdown: Record<string, { count: number; reviewCount: number }>;
  latencyMs: { count: number; p50: number | null; p95: number | null };
  inputTokens: { count: number; total: number; average: number | null };
  estimatedCostUsd: number;
  actualCostUsd: number | null;
  apiFailureCount: number;
  timeoutCount: number;
  repeatedRunDisagreement: number | null;
}

function rate(numerator: number, denominator: number): number | null {
  return denominator === 0 ? null : numerator / denominator;
}

function percentile(values: number[], percentileValue: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil(percentileValue * sorted.length) - 1);
  return sorted[index];
}

function incrementBreakdown(target: Record<string, { count: number; reviewCount: number }>, key: string, reviewed: boolean): void {
  const current = target[key] ?? { count: 0, reviewCount: 0 };
  current.count += 1;
  if (reviewed) current.reviewCount += 1;
  target[key] = current;
}

const GOLD_KEY_BY_RUBRIC_ID: Record<string, string> = {
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

export function calculateMetrics(
  dataset: CandidateRecord[],
  results: EvaluationResult[],
  options: { inputCostUsdPerMillionTokens: number; balancedHistoricalSet?: boolean } = { inputCostUsdPerMillionTokens: 0.042 },
): EvaluationMetrics {
  const byCaseId = new Map(dataset.map((candidate) => [candidate.caseId, candidate]));
  const criterionIds = new Set<string>();
  const criterion = new Map<string, { tp: number; fp: number; fn: number; tn: number }>();
  const latencies: number[] = [];
  const inputTokens: number[] = [];
  const areaBreakdown: EvaluationMetrics["areaBreakdown"] = {};
  const kindBreakdown: EvaluationMetrics["kindBreakdown"] = {};
  const questionTypeBreakdown: EvaluationMetrics["questionTypeBreakdown"] = {};
  const instructionLanguageBreakdown: EvaluationMetrics["instructionLanguageBreakdown"] = {};
  let criticalTotal = 0;
  let criticalReviewed = 0;
  let noneTotal = 0;
  let noneReviewed = 0;
  let apiFailureCount = 0;
  let timeoutCount = 0;
  let actualCostUsd = 0;
  let hasActualCost = false;

  for (const result of results) {
    const candidate = byCaseId.get(result.caseId);
    if (!candidate) continue;
    const reviewed = result.derivedPolicyResult.decision === "REVIEW";
    incrementBreakdown(areaBreakdown, candidate.area, reviewed);
    incrementBreakdown(kindBreakdown, candidate.kind, reviewed);
    if (candidate.kind === "QUESTION") incrementBreakdown(questionTypeBreakdown, String(candidate.content.questionType ?? "UNKNOWN"), reviewed);
    incrementBreakdown(instructionLanguageBreakdown, result.instructionLanguage, reviewed);
    if (result.latencyMs !== undefined) latencies.push(result.latencyMs);
    if (result.inputTokens !== undefined) inputTokens.push(result.inputTokens);
    if (result.error?.kind === "API_FAILURE" || result.error?.kind === "INVALID_RESPONSE") apiFailureCount += 1;
    if (result.error?.kind === "TIMEOUT") timeoutCount += 1;
    const actual = (result as EvaluationResult & { actualCostUsd?: number }).actualCostUsd;
    if (typeof actual === "number") {
      hasActualCost = true;
      actualCostUsd += actual;
    }

    const gold = candidate.candidateGold as unknown as Record<string, unknown>;
    for (const [id, prediction] of Object.entries(result.criterionPredictions ?? {})) {
      criterionIds.add(id);
      const current = criterion.get(id) ?? { tp: 0, fp: 0, fn: 0, tn: 0 };
      const expected = gold[GOLD_KEY_BY_RUBRIC_ID[id] ?? id] === true;
      if (prediction && expected) current.tp += 1;
      else if (prediction && !expected) current.fp += 1;
      else if (!prediction && expected) current.fn += 1;
      else current.tn += 1;
      criterion.set(id, current);
    }

    if (candidate.candidateGoldSeverity === "P0" || candidate.candidateGoldSeverity === "P1") {
      criticalTotal += 1;
      if (reviewed) criticalReviewed += 1;
    }
    if (candidate.candidateGoldSeverity === "NONE") {
      noneTotal += 1;
      if (reviewed) noneReviewed += 1;
    }
  }

  const criterionMetrics = Object.fromEntries([...criterionIds].sort().map((id) => {
    const value = criterion.get(id) ?? { tp: 0, fp: 0, fn: 0, tn: 0 };
    return [id, {
      truePositive: value.tp,
      falsePositive: value.fp,
      falseNegative: value.fn,
      trueNegative: value.tn,
      precision: rate(value.tp, value.tp + value.fp),
      recall: rate(value.tp, value.tp + value.fn),
    }];
  }));

  const repeated = new Map<string, { count: number; decisions: Set<string> }>();
  for (const result of results) {
    const key = `${result.caseId}:${result.instructionLanguage}`;
    const entry = repeated.get(key) ?? { count: 0, decisions: new Set<string>() };
    entry.count += 1;
    entry.decisions.add(result.derivedPolicyResult.decision);
    repeated.set(key, entry);
  }
  const repeatedGroups = [...repeated.values()].filter((entry) => entry.count > 1);

  return {
    criterion: criterionMetrics,
    criticalIssueRecall: rate(criticalReviewed, criticalTotal),
    falseNegativeRate: rate([...criterion.values()].reduce((sum, value) => sum + value.fn, 0), [...criterion.values()].reduce((sum, value) => sum + value.fn + value.tp, 0)),
    falsePositiveRate: rate(noneReviewed, noneTotal),
    humanReviewReductionRate: options.balancedHistoricalSet ? null : rate(noneTotal - noneReviewed, noneTotal),
    areaBreakdown,
    kindBreakdown,
    questionTypeBreakdown,
    instructionLanguageBreakdown,
    latencyMs: { count: latencies.length, p50: percentile(latencies, 0.5), p95: percentile(latencies, 0.95) },
    inputTokens: { count: inputTokens.length, total: inputTokens.reduce((sum, value) => sum + value, 0), average: rate(inputTokens.reduce((sum, value) => sum + value, 0), inputTokens.length) },
    estimatedCostUsd: inputTokens.reduce((sum, value) => sum + value, 0) * options.inputCostUsdPerMillionTokens / 1_000_000,
    actualCostUsd: hasActualCost ? actualCostUsd : null,
    apiFailureCount,
    timeoutCount,
    repeatedRunDisagreement: repeatedGroups.length === 0 ? null : repeatedGroups.filter((entry) => entry.decisions.size > 1).length / repeatedGroups.length,
  };
}
