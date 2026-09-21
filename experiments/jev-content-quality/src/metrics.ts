import { criterionGold } from "./gold.js";
import type { CandidateRecord, EvaluationResult, InstructionLanguage, QuestionGold } from "./types.js";

export interface ConfusionMetric {
  truePositive: number;
  falsePositive: number;
  falseNegative: number;
  trueNegative: number;
  precision: number | null;
  recall: number | null;
}

export interface DifficultyFitMetrics {
  count: number;
  accuracy: number | null;
  confusionMatrix: Record<"TOO_EASY" | "APPROPRIATE" | "TOO_HARD", Record<"TOO_EASY" | "APPROPRIATE" | "TOO_HARD", number>>;
}

export interface QualityMetrics {
  criterion: Record<string, ConfusionMetric>;
  criticalIssueRecall: number | null;
  criticalIssueFalseNegativeRate: number | null;
  criterionFalseNegativeRate: number | null;
  falsePositiveRate: number | null;
  humanReviewReductionRate: number | null;
  successfulPolicyEvaluationCount: number;
  difficultyFit: DifficultyFitMetrics;
  areaBreakdown: Record<string, { count: number; reviewCount: number }>;
  kindBreakdown: Record<string, { count: number; reviewCount: number }>;
  questionTypeBreakdown: Record<string, { count: number; reviewCount: number }>;
  repeatedRunDisagreement: number | null;
}

export interface LanguageQualityMetrics {
  criterion: Record<string, ConfusionMetric>;
  criticalIssueRecall: number | null;
  falsePositiveRate: number | null;
  difficultyAccuracy: number | null;
  successfulPolicyEvaluationCount: number;
}

export interface LanguageComparisonMetrics {
  caseGroupIds: string[];
  pairedCaseCount: number;
  ko: LanguageQualityMetrics;
  en: LanguageQualityMetrics;
  pairedDecisions: {
    comparableCount: number;
    sameDecision: number;
    koReviewEnPass: number;
    koPassEnReview: number;
    unavailablePairs: number;
  };
}

export interface EvaluationMetrics extends QualityMetrics {
  primaryInstructionLanguage: InstructionLanguage;
  languageComparison: LanguageComparisonMetrics;
  instructionLanguageBreakdown: Record<string, { count: number; reviewCount: number }>;
  latencyMs: { count: number; p50: number | null; p95: number | null };
  inputTokens: { count: number; total: number; average: number | null };
  estimatedCostUsd: number;
  actualCostUsd: number | null;
  apiFailureCount: number;
  invalidResponseCount: number;
  timeoutCount: number;
  uncalibratedCount: number;
}

export interface MetricsOptions {
  inputCostUsdPerMillionTokens: number;
  balancedHistoricalSet?: boolean;
  primaryInstructionLanguage?: InstructionLanguage;
  languageExperimentCaseGroups?: ReadonlySet<string>;
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

function isSuccessfulPolicyEvaluation(result: EvaluationResult): boolean {
  return result.error === undefined && (result.derivedPolicyResult.decision === "PASS" || result.derivedPolicyResult.decision === "REVIEW");
}

const DIFFICULTY_VALUES = ["TOO_EASY", "APPROPRIATE", "TOO_HARD"] as const;
type DifficultyValue = (typeof DIFFICULTY_VALUES)[number];

function emptyDifficultyMatrix(): DifficultyFitMetrics["confusionMatrix"] {
  return Object.fromEntries(DIFFICULTY_VALUES.map((expected) => [
    expected,
    Object.fromEntries(DIFFICULTY_VALUES.map((predicted) => [predicted, 0])),
  ])) as DifficultyFitMetrics["confusionMatrix"];
}

function calculateQualityMetrics(
  dataset: CandidateRecord[],
  results: EvaluationResult[],
  balancedHistoricalSet: boolean,
): QualityMetrics {
  const byCaseId = new Map(dataset.map((candidate) => [candidate.caseId, candidate]));
  const criterionIds = new Set<string>();
  const criterion = new Map<string, { tp: number; fp: number; fn: number; tn: number }>();
  const areaBreakdown: QualityMetrics["areaBreakdown"] = {};
  const kindBreakdown: QualityMetrics["kindBreakdown"] = {};
  const questionTypeBreakdown: QualityMetrics["questionTypeBreakdown"] = {};
  const difficultyConfusion = emptyDifficultyMatrix();
  let difficultyCount = 0;
  let difficultyCorrect = 0;
  let successfulPolicyEvaluationCount = 0;
  let criticalTotal = 0;
  let criticalReviewed = 0;
  let nonCriticalTotal = 0;
  let nonCriticalReviewed = 0;
  let passCount = 0;

  for (const result of results) {
    const candidate = byCaseId.get(result.caseId);
    if (!candidate || !isSuccessfulPolicyEvaluation(result)) continue;
    successfulPolicyEvaluationCount += 1;
    const reviewed = result.derivedPolicyResult.decision === "REVIEW";
    if (!reviewed) passCount += 1;
    incrementBreakdown(areaBreakdown, candidate.area, reviewed);
    incrementBreakdown(kindBreakdown, candidate.kind, reviewed);
    if (candidate.kind === "QUESTION") incrementBreakdown(questionTypeBreakdown, String(candidate.content.questionType ?? "UNKNOWN"), reviewed);

    for (const [id, prediction] of Object.entries(result.criterionPredictions ?? {})) {
      const expected = criterionGold(candidate, id);
      if (expected === undefined) continue;
      criterionIds.add(id);
      const current = criterion.get(id) ?? { tp: 0, fp: 0, fn: 0, tn: 0 };
      if (prediction && expected) current.tp += 1;
      else if (prediction && !expected) current.fp += 1;
      else if (!prediction && expected) current.fn += 1;
      else current.tn += 1;
      criterion.set(id, current);
    }

    if (candidate.candidateGoldSeverity === "P0" || candidate.candidateGoldSeverity === "P1") {
      criticalTotal += 1;
      if (reviewed) criticalReviewed += 1;
    } else {
      nonCriticalTotal += 1;
      if (reviewed) nonCriticalReviewed += 1;
    }

    if (candidate.kind === "QUESTION") {
      const expected = (candidate.candidateGold as QuestionGold).difficultyFit;
      const predicted = result.rawAnswers?.difficulty_fit?.choice;
      if (typeof predicted === "string" && DIFFICULTY_VALUES.includes(predicted as DifficultyValue)) {
        difficultyCount += 1;
        if (expected === predicted) difficultyCorrect += 1;
        difficultyConfusion[expected][predicted as DifficultyValue] += 1;
      }
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
  const criticalIssueRecall = rate(criticalReviewed, criticalTotal);
  const criterionFalseNegatives = [...criterion.values()].reduce((sum, value) => sum + value.fn, 0);
  const criterionPositives = [...criterion.values()].reduce((sum, value) => sum + value.fn + value.tp, 0);

  const repeated = new Map<string, { count: number; decisions: Set<string> }>();
  for (const result of results) {
    if (!isSuccessfulPolicyEvaluation(result)) continue;
    const key = `${result.caseId}:${result.instructionLanguage}`;
    const entry = repeated.get(key) ?? { count: 0, decisions: new Set<string>() };
    entry.count += 1;
    entry.decisions.add(result.derivedPolicyResult.decision);
    repeated.set(key, entry);
  }
  const repeatedGroups = [...repeated.values()].filter((entry) => entry.count > 1);

  return {
    criterion: criterionMetrics,
    criticalIssueRecall,
    criticalIssueFalseNegativeRate: criticalIssueRecall === null ? null : 1 - criticalIssueRecall,
    criterionFalseNegativeRate: rate(criterionFalseNegatives, criterionPositives),
    falsePositiveRate: rate(nonCriticalReviewed, nonCriticalTotal),
    humanReviewReductionRate: balancedHistoricalSet ? null : rate(passCount, successfulPolicyEvaluationCount),
    successfulPolicyEvaluationCount,
    difficultyFit: {
      count: difficultyCount,
      accuracy: rate(difficultyCorrect, difficultyCount),
      confusionMatrix: difficultyConfusion,
    },
    areaBreakdown,
    kindBreakdown,
    questionTypeBreakdown,
    repeatedRunDisagreement: repeatedGroups.length === 0 ? null : repeatedGroups.filter((entry) => entry.decisions.size > 1).length / repeatedGroups.length,
  };
}

function languageQuality(quality: QualityMetrics): LanguageQualityMetrics {
  return {
    criterion: quality.criterion,
    criticalIssueRecall: quality.criticalIssueRecall,
    falsePositiveRate: quality.falsePositiveRate,
    difficultyAccuracy: quality.difficultyFit.accuracy,
    successfulPolicyEvaluationCount: quality.successfulPolicyEvaluationCount,
  };
}

function calculateLanguageComparison(
  dataset: CandidateRecord[],
  results: EvaluationResult[],
  caseGroupIds: ReadonlySet<string>,
  balancedHistoricalSet: boolean,
): LanguageComparisonMetrics {
  const buckets = new Map<string, Partial<Record<InstructionLanguage, EvaluationResult>>>();
  for (const result of results) {
    if (!caseGroupIds.has(result.caseGroupId)) continue;
    const key = `${result.caseId}:${result.repeatIndex}`;
    const bucket = buckets.get(key) ?? {};
    bucket[result.instructionLanguage] = result;
    buckets.set(key, bucket);
  }

  const pairs = [...buckets.values()].filter((bucket) => bucket.ko && bucket.en) as Array<{ ko: EvaluationResult; en: EvaluationResult }>;
  const koResults = pairs.map((pair) => pair.ko);
  const enResults = pairs.map((pair) => pair.en);
  const koQuality = calculateQualityMetrics(dataset, koResults, balancedHistoricalSet);
  const enQuality = calculateQualityMetrics(dataset, enResults, balancedHistoricalSet);
  let comparableCount = 0;
  let sameDecision = 0;
  let koReviewEnPass = 0;
  let koPassEnReview = 0;
  let unavailablePairs = 0;
  for (const pair of pairs) {
    if (!isSuccessfulPolicyEvaluation(pair.ko) || !isSuccessfulPolicyEvaluation(pair.en)) {
      unavailablePairs += 1;
      continue;
    }
    comparableCount += 1;
    const koDecision = pair.ko.derivedPolicyResult.decision;
    const enDecision = pair.en.derivedPolicyResult.decision;
    if (koDecision === enDecision) sameDecision += 1;
    else if (koDecision === "REVIEW" && enDecision === "PASS") koReviewEnPass += 1;
    else if (koDecision === "PASS" && enDecision === "REVIEW") koPassEnReview += 1;
  }

  return {
    caseGroupIds: [...caseGroupIds].sort(),
    pairedCaseCount: pairs.length,
    ko: languageQuality(koQuality),
    en: languageQuality(enQuality),
    pairedDecisions: { comparableCount, sameDecision, koReviewEnPass, koPassEnReview, unavailablePairs },
  };
}

export function calculateMetrics(
  dataset: CandidateRecord[],
  results: EvaluationResult[],
  options: MetricsOptions = { inputCostUsdPerMillionTokens: 0.042 },
): EvaluationMetrics {
  const primaryInstructionLanguage = options.primaryInstructionLanguage ?? "ko";
  const balancedHistoricalSet = options.balancedHistoricalSet ?? false;
  const primaryResults = results.filter((result) => result.instructionLanguage === primaryInstructionLanguage);
  const quality = calculateQualityMetrics(dataset, primaryResults, balancedHistoricalSet);
  const languageComparison = calculateLanguageComparison(
    dataset,
    results,
    options.languageExperimentCaseGroups ?? new Set<string>(),
    balancedHistoricalSet,
  );

  const latencies: number[] = [];
  const inputTokens: number[] = [];
  const instructionLanguageBreakdown: EvaluationMetrics["instructionLanguageBreakdown"] = {};
  let apiFailureCount = 0;
  let invalidResponseCount = 0;
  let timeoutCount = 0;
  let uncalibratedCount = 0;
  let actualCostUsd = 0;
  let hasActualCost = false;

  for (const result of results) {
    incrementBreakdown(instructionLanguageBreakdown, result.instructionLanguage, result.derivedPolicyResult.decision === "REVIEW");
    if (result.latencyMs !== undefined) latencies.push(result.latencyMs);
    if (result.inputTokens !== undefined) inputTokens.push(result.inputTokens);
    if (result.error?.kind === "API_FAILURE") apiFailureCount += 1;
    if (result.error?.kind === "INVALID_RESPONSE") invalidResponseCount += 1;
    if (result.error?.kind === "TIMEOUT") timeoutCount += 1;
    if (result.derivedPolicyResult.decision === "UNCALIBRATED") uncalibratedCount += 1;
    const actual = (result as EvaluationResult & { actualCostUsd?: number }).actualCostUsd;
    if (typeof actual === "number") {
      hasActualCost = true;
      actualCostUsd += actual;
    }
  }

  const totalInputTokens = inputTokens.reduce((sum, value) => sum + value, 0);
  return {
    ...quality,
    primaryInstructionLanguage,
    languageComparison,
    instructionLanguageBreakdown,
    latencyMs: { count: latencies.length, p50: percentile(latencies, 0.5), p95: percentile(latencies, 0.95) },
    inputTokens: { count: inputTokens.length, total: totalInputTokens, average: rate(totalInputTokens, inputTokens.length) },
    estimatedCostUsd: totalInputTokens * options.inputCostUsdPerMillionTokens / 1_000_000,
    actualCostUsd: hasActualCost ? actualCostUsd : null,
    apiFailureCount,
    invalidResponseCount,
    timeoutCount,
    uncalibratedCount,
  };
}
