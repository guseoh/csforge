import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_MODEL, TypeSafeApiError, validateJevResponse } from "./client.js";
import { buildRubricForVersion, RUBRIC_VERSION } from "./rubric.js";
import type { JevResponse, RubricQuestion } from "./types.js";
import type { ReviewCandidate } from "./review-selection.js";

export const DEFAULT_MAX_CANDIDATES = 50;
export const INPUT_COST_USD_PER_MILLION_TOKENS = 0.042;
const REQUESTED_CRITERIA = ["weak_distractor"] as const;

export interface ReviewPriorityClient {
  evaluate(
    state: Record<string, unknown>,
    questions: Record<string, RubricQuestion>,
  ): Promise<{ response: JevResponse; latencyMs: number }>;
}

export interface ReviewPriorityResult {
  contentKey: string;
  area: string;
  sourcePath: string;
  weakDistractorProbability: number | null;
  requestedModel: string;
  resolvedModel: string | null;
  rubricVersion: string;
  inputTokens: number | null;
  latencyMs: number;
  evaluationStatus: "EVALUATED" | "API_ERROR";
  errorKind?: "API_FAILURE" | "TIMEOUT" | "INVALID_RESPONSE";
}

export interface ReviewSummary {
  candidateCount: number;
  evaluatedCount: number;
  skippedCount: number;
  apiErrorCount: number;
  inputTokens: number;
  estimatedInputCostUsd: number;
  latencyMs: { p50: number | null; p95: number | null };
  reportRows: number;
  reportViewOmitted: number;
}

export interface ReviewViewOptions {
  top?: number;
  topPercent?: number;
  skippedCount?: number;
}

export interface WrittenReviewArtifacts {
  jsonlPath: string;
  reportPath: string;
  summary: ReviewSummary;
}

export function assertCandidateLimit(candidateCount: number, maxCandidates: number): void {
  if (!Number.isInteger(maxCandidates) || maxCandidates < 1) throw new Error("maxCandidates must be a positive integer");
  if (candidateCount > maxCandidates) {
    throw new Error(`Candidate count ${candidateCount} exceeds max candidate limit ${maxCandidates}; no provider calls were made`);
  }
}

export function requireApiKey(apiKey: string | undefined): string {
  if (!apiKey) throw new Error("TYPESAFE_API_KEY unavailable; Jev evaluation was not run and no scores were generated");
  return apiKey;
}

export function validateReviewViewOptions(options: ReviewViewOptions): void {
  reportRowCount(0, options);
}

export async function evaluateReviewCandidates(
  candidates: readonly ReviewCandidate[],
  client: ReviewPriorityClient,
  requestedModel = DEFAULT_MODEL,
): Promise<ReviewPriorityResult[]> {
  const ordered = [...candidates].sort((left, right) => left.contentKey.localeCompare(right.contentKey));
  const rubric = buildRubricForVersion(RUBRIC_VERSION, "QUESTION", "ko", "MULTIPLE_CHOICE", REQUESTED_CRITERIA);
  const results: ReviewPriorityResult[] = [];

  for (const candidate of ordered) {
    const startedAt = Date.now();
    try {
      const evaluated = await client.evaluate(candidate.state, rubric.questions);
      const response = validateJevResponse(evaluated.response, rubric.questions);
      const answer = response.answers.weak_distractor;
      if (answer.type !== "noul" || typeof answer.noul !== "number") {
        throw new TypeSafeApiError("Invalid TypeSafe response: weak_distractor must be a Noul probability", undefined, "INVALID_RESPONSE");
      }
      results.push({
        contentKey: candidate.contentKey,
        area: candidate.area,
        sourcePath: candidate.sourcePath,
        weakDistractorProbability: answer.noul,
        requestedModel,
        resolvedModel: response.model,
        rubricVersion: RUBRIC_VERSION,
        inputTokens: response.usage?.input_tokens ?? null,
        latencyMs: evaluated.latencyMs,
        evaluationStatus: "EVALUATED",
      });
    } catch (error) {
      const apiError = error instanceof TypeSafeApiError ? error : new TypeSafeApiError(String(error));
      results.push({
        contentKey: candidate.contentKey,
        area: candidate.area,
        sourcePath: candidate.sourcePath,
        weakDistractorProbability: null,
        requestedModel,
        resolvedModel: null,
        rubricVersion: RUBRIC_VERSION,
        inputTokens: null,
        latencyMs: Date.now() - startedAt,
        evaluationStatus: "API_ERROR",
        errorKind: apiError.kind,
      });
    }
  }
  return results;
}

export function rankReviewResults(results: readonly ReviewPriorityResult[]): ReviewPriorityResult[] {
  return [...results].sort((left, right) => {
    if (left.weakDistractorProbability === null && right.weakDistractorProbability === null) {
      return left.contentKey.localeCompare(right.contentKey);
    }
    if (left.weakDistractorProbability === null) return 1;
    if (right.weakDistractorProbability === null) return -1;
    return right.weakDistractorProbability - left.weakDistractorProbability
      || left.contentKey.localeCompare(right.contentKey);
  });
}

export async function writeReviewArtifacts(
  outputDirectory: string,
  candidates: readonly ReviewCandidate[],
  results: readonly ReviewPriorityResult[],
  options: ReviewViewOptions = {},
): Promise<WrittenReviewArtifacts> {
  const ranked = rankReviewResults(results);
  const successful = ranked.filter((result) => result.evaluationStatus === "EVALUATED");
  const reportRows = reportRowCount(successful.length, options);
  const displayed = successful.slice(0, reportRows);
  const summary = summarize(results, options.skippedCount ?? 0, reportRows, successful.length - reportRows);
  const candidateByKey = new Map(candidates.map((candidate) => [candidate.contentKey, candidate]));

  await mkdir(outputDirectory, { recursive: true });
  const jsonlPath = path.join(outputDirectory, "jev-review-priority-results.jsonl");
  const reportPath = path.join(outputDirectory, "jev-review-priority-report.md");
  await writeFile(jsonlPath, ranked.map((result) => JSON.stringify(result)).join("\n") + "\n", "utf8");
  await writeFile(reportPath, renderReport(displayed, ranked, candidateByKey, summary), "utf8");
  return { jsonlPath, reportPath, summary };
}

function reportRowCount(evaluatedCount: number, options: ReviewViewOptions): number {
  if (options.top !== undefined && options.topPercent !== undefined) {
    throw new Error("Use only one of --top or --top-percent");
  }
  if (options.top !== undefined) {
    if (!Number.isInteger(options.top) || options.top < 1) throw new Error("--top must be a positive integer");
    return Math.min(options.top, evaluatedCount);
  }
  if (options.topPercent !== undefined) {
    if (!Number.isFinite(options.topPercent) || options.topPercent <= 0 || options.topPercent > 100) {
      throw new Error("--top-percent must be greater than 0 and at most 100");
    }
    return Math.min(Math.ceil(evaluatedCount * options.topPercent / 100), evaluatedCount);
  }
  return evaluatedCount;
}

function summarize(
  results: readonly ReviewPriorityResult[],
  skippedCount: number,
  reportRows: number,
  reportViewOmitted: number,
): ReviewSummary {
  const evaluated = results.filter((result) => result.evaluationStatus === "EVALUATED");
  const inputTokens = evaluated.reduce((total, result) => total + (result.inputTokens ?? 0), 0);
  const latencies = results.map((result) => result.latencyMs);
  return {
    candidateCount: results.length,
    evaluatedCount: evaluated.length,
    skippedCount,
    apiErrorCount: results.length - evaluated.length,
    inputTokens,
    estimatedInputCostUsd: inputTokens * INPUT_COST_USD_PER_MILLION_TOKENS / 1_000_000,
    latencyMs: { p50: percentile(latencies, 0.5), p95: percentile(latencies, 0.95) },
    reportRows,
    reportViewOmitted,
  };
}

function percentile(values: readonly number[], fraction: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.ceil(fraction * sorted.length) - 1)];
}

function renderReport(
  displayed: readonly ReviewPriorityResult[],
  ranked: readonly ReviewPriorityResult[],
  candidateByKey: ReadonlyMap<string, ReviewCandidate>,
  summary: ReviewSummary,
): string {
  const lines = [
    "# Jev weak-distractor Human Review Priority",
    "",
    "This report orders MULTIPLE_CHOICE Questions for human distractor review. Probability and rank are diagnostic signals only.",
    "",
    "## Run summary",
    "",
    `- Candidate count: ${summary.candidateCount}`,
    `- Evaluated count: ${summary.evaluatedCount}`,
    `- Skipped changed Questions: ${summary.skippedCount}`,
    `- API error count: ${summary.apiErrorCount}`,
    `- Input tokens: ${summary.inputTokens}`,
    `- Estimated input cost: $${summary.estimatedInputCostUsd.toFixed(9)}`,
    `- Latency p50: ${summary.latencyMs.p50 ?? "N/A"} ms`,
    `- Latency p95: ${summary.latencyMs.p95 ?? "N/A"} ms`,
    `- Review queue rows shown: ${summary.reportRows}`,
    `- Review queue rows omitted by view limit: ${summary.reportViewOmitted}`,
    "",
    "## Ranked review queue",
    "",
  ];

  displayed.forEach((result, index) => {
    const candidate = candidateByKey.get(result.contentKey);
    if (!candidate || result.weakDistractorProbability === null) return;
    lines.push(
      `### ${index + 1}. ${result.contentKey}`,
      "",
      `- LearningArea: ${result.area}`,
      `- Probability: ${result.weakDistractorProbability.toFixed(4)}`,
      `- Source file: \`${result.sourcePath}\``,
      `- Correct choice key: \`${candidate.question.correctChoiceKey}\``,
      "",
      "Question:",
      "",
      ...markdownQuote(candidate.question.promptMarkdown),
      "",
      "Choices:",
      "",
      ...[...candidate.question.choices!].sort((left, right) => left.displayOrder - right.displayOrder)
        .map((choice) => `- ${choice.key}: ${choice.content.replaceAll(/\r?\n/g, " ")}`),
      "",
    );
  });

  const errors = ranked.filter((result) => result.evaluationStatus === "API_ERROR");
  if (errors.length > 0) {
    lines.push("## API errors", "");
    for (const result of errors) lines.push(`- \`${result.contentKey}\`: ${result.errorKind ?? "API_FAILURE"}`);
    lines.push("");
  }
  return lines.join("\n") + "\n";
}

function markdownQuote(value: string): string[] {
  return value.split(/\r?\n/).map((line) => `> ${line}`);
}
