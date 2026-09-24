import { createHash } from "node:crypto";
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { DEFAULT_MODEL, TypeSafeApiError, TypeSafeDirectClient } from "./client.js";
import type { RubricQuestion } from "./types.js";

export const RATIONALE_RUBRIC_VERSION = "rationale-quality-v2";
export const CRITERIA = ["choice_rationale_misalignment", "choice_rationale_conflict", "choice_rationale_shallow"] as const;
type Criterion = typeof CRITERIA[number];
type SourceKind = "natural" | "historical" | "synthetic";
type Split = "development" | "holdout";
export type Case = {
  caseId: string; groupId: string; sourceKind: SourceKind; split: Split; area: string;
  contentKey: string; choiceKey: string; promptMarkdown: string;
  choices: { key: string; content: string }[]; correctChoiceKey: string;
  explanationMarkdown: string; rationaleMarkdown: string;
  gold: Record<Criterion, boolean>; goldReason: string; source: Record<string, unknown>;
};
export type Result = {
  caseId: string; sourceKind: SourceKind; split: Split; model?: string;
  probabilities?: Record<Criterion, number>; score?: number;
  inputTokens?: number; outputTokens?: number; latencyMs?: number;
  status: "evaluated" | "copy-excluded" | "error"; errorKind?: string;
};
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_PATH = path.join(ROOT, "data/rationale-cases.jsonl");
const FREEZE_PATH = path.join(ROOT, "data/rationale-freeze.json");
const OUTPUT_DIR = path.join(ROOT, "results/rationale-quality");
const INPUT_COST_USD_PER_MILLION = 0.042;

export const RATIONALE_QUESTIONS: Record<Criterion, RubricQuestion> = {
  choice_rationale_misalignment: {
    type: "noul",
    instructions: "targetChoiceContent와 targetRationaleMarkdown를 직접 대조하라. rationale가 대상 선택지 대신 다른 선택지의 주장만 설명하여 대상의 정오 근거를 제공하지 않을 확률은? 오답 선택지의 오개념을 반박하려고 다른 개념을 비교·언급하는 것은 정상적인 근거다. 표현이나 용어가 달라도 같은 주장을 설명하면 결함이 아니다. 이유가 부족할 뿐인 경우는 이 기준에서 제외한다.",
  },
  choice_rationale_conflict: {
    type: "noul",
    instructions: "대상 선택지의 rationaleMarkdown이 선택지의 정오, 명시된 기술 사실 또는 공통 해설과 양립할 수 없는 주장을 할 확률은? 단순한 표현 차이와 빠진 설명은 제외한다.",
  },
  choice_rationale_shallow: {
    type: "noul",
    instructions: "대상 선택지의 rationaleMarkdown이 정오 선언이나 선택지 되풀이에 그치고, 학습자가 판단할 수 있는 조건·기전·인과 근거를 주지 않을 확률은? 짧아도 구체적인 이유가 있으면 결함으로 보지 않는다.",
  },
};

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export function loadCases(): Case[] {
  const cases = readFileSync(DATA_PATH, "utf8").trim().split("\n").map((line) => JSON.parse(line) as Case);
  const ids = new Set<string>();
  const splitByGroup = new Map<string, Split>();
  for (const candidate of cases) {
    if (ids.has(candidate.caseId)) throw new Error(`Duplicate case ID: ${candidate.caseId}`);
    ids.add(candidate.caseId);
    if (!["natural", "historical", "synthetic"].includes(candidate.sourceKind)) throw new Error(`Invalid kind: ${candidate.caseId}`);
    if (!["development", "holdout"].includes(candidate.split)) throw new Error(`Invalid split: ${candidate.caseId}`);
    const groupSplit = splitByGroup.get(candidate.groupId);
    if (groupSplit && groupSplit !== candidate.split) throw new Error(`Group crosses splits: ${candidate.groupId}`);
    splitByGroup.set(candidate.groupId, candidate.split);
    if (!candidate.promptMarkdown || !candidate.explanationMarkdown || !candidate.rationaleMarkdown ||
        !candidate.goldReason || candidate.choices.length !== 4 ||
        !candidate.choices.some((choice) => choice.key === candidate.choiceKey) ||
        !candidate.choices.some((choice) => choice.key === candidate.correctChoiceKey) ||
        CRITERIA.some((criterion) => typeof candidate.gold[criterion] !== "boolean")) {
      throw new Error(`Incomplete case: ${candidate.caseId}`);
    }
  }
  for (const kind of ["natural", "historical", "synthetic"] as const) {
    for (const split of ["development", "holdout"] as const) {
      if (!cases.some((candidate) => candidate.sourceKind === kind && candidate.split === split)) {
        throw new Error(`Missing ${kind}/${split} stratum`);
      }
    }
  }
  return cases;
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}

export function isExplanationCopy(rationale: string, explanation: string): boolean {
  const left = normalize(rationale);
  const right = normalize(explanation);
  if (left.length > 0 && left === right) return true;
  if (left.length < 30 || right.length < 30) return false;
  if (left.length >= 60 && right.includes(left)) return true;
  const grams = (value: string) => new Set(Array.from({ length: Math.max(0, value.length - 2) }, (_, index) => value.slice(index, index + 3)));
  const a = grams(left);
  const b = grams(right);
  const overlap = [...a].filter((gram) => b.has(gram)).length;
  return overlap / Math.max(a.size, b.size) >= 0.9;
}

export function stateFor(candidate: Case): Record<string, unknown> {
  return {
    questionPromptMarkdown: candidate.promptMarkdown,
    choices: candidate.choices,
    correctChoiceKey: candidate.correctChoiceKey,
    explanationMarkdown: candidate.explanationMarkdown,
    targetChoiceKey: candidate.choiceKey,
    targetChoiceContent: candidate.choices.find((choice) => choice.key === candidate.choiceKey)?.content,
    targetChoiceIsCorrect: candidate.choiceKey === candidate.correctChoiceKey,
    targetRationaleMarkdown: candidate.rationaleMarkdown,
  };
}

function readFreeze(): { datasetSha256: string; rubricSha256: string } {
  return JSON.parse(readFileSync(FREEZE_PATH, "utf8")) as { datasetSha256: string; rubricSha256: string };
}

export function freezeHashes(): { datasetSha256: string; rubricSha256: string } {
  return {
    datasetSha256: sha256(readFileSync(DATA_PATH, "utf8")),
    rubricSha256: sha256(JSON.stringify(RATIONALE_QUESTIONS) + RATIONALE_RUBRIC_VERSION),
  };
}

function verifyFreeze(): void {
  const expected = readFreeze();
  const actual = freezeHashes();
  if (expected.datasetSha256 !== actual.datasetSha256 || expected.rubricSha256 !== actual.rubricSha256) {
    throw new Error("Dataset or rubric changed after the holdout freeze");
  }
}

export function auc(rows: { score: number; positive: boolean }[]): number | null {
  const positives = rows.filter((row) => row.positive);
  const negatives = rows.filter((row) => !row.positive);
  if (!positives.length || !negatives.length) return null;
  let wins = 0;
  for (const positive of positives) for (const negative of negatives) {
    wins += positive.score > negative.score ? 1 : positive.score === negative.score ? 0.5 : 0;
  }
  return wins / (positives.length * negatives.length);
}

export function metrics(cases: Case[], results: Result[]) {
  const byId = new Map(cases.map((candidate) => [candidate.caseId, candidate]));
  const usable = results.filter((result) => result.status === "evaluated" || result.status === "copy-excluded");
  const rows = usable.map((result) => {
    const candidate = byId.get(result.caseId);
    if (!candidate || result.score === undefined || !result.probabilities) throw new Error(`Missing result data: ${result.caseId}`);
    return { candidate, result, positive: CRITERIA.some((criterion) => candidate.gold[criterion]), score: result.score };
  });
  const groups = ["natural", "historical", "synthetic"] as const;
  const ranking = Object.fromEntries(groups.map((kind) => {
    const selected = rows.filter((row) => row.candidate.sourceKind === kind)
      .sort((a, b) => b.score - a.score || a.candidate.caseId.localeCompare(b.candidate.caseId));
    const positives = selected.filter((row) => row.positive).length;
    const budgets = Object.fromEntries([10, 20, 30].map((percent) => {
      const count = Math.ceil(selected.length * percent / 100);
      const found = selected.slice(0, count).filter((row) => row.positive).length;
      const precision = count ? found / count : null;
      const prevalence = selected.length ? positives / selected.length : null;
      return [String(percent), { reviewed: count, found, recall: positives ? found / positives : null,
        precision, liftVsRandom: prevalence && precision !== null ? precision / prevalence : null }];
    }));
    return [kind, { count: selected.length, positives, prevalence: selected.length ? positives / selected.length : null,
      rocAuc: auc(selected), budgets }];
  }));
  const criterion = Object.fromEntries(groups.map((kind) => [kind, Object.fromEntries(CRITERIA.map((name) => {
    const selected = rows.filter((row) => row.candidate.sourceKind === kind && row.result.status === "evaluated");
    const falsePositive = selected.filter((row) => !row.candidate.gold[name] && row.result.probabilities![name] >= 0.5).length;
    const falseNegative = selected.filter((row) => row.candidate.gold[name] && row.result.probabilities![name] < 0.5).length;
    return [name, { positives: selected.filter((row) => row.candidate.gold[name]).length, falsePositive, falseNegative,
      rocAuc: auc(selected.map((row) => ({ score: row.result.probabilities![name], positive: row.candidate.gold[name] }))) }];
  }))]));
  const latencies = usable.flatMap((result) => result.latencyMs === undefined ? [] : [result.latencyMs]).sort((a, b) => a - b);
  const percentile = (p: number) => latencies.length ? latencies[Math.ceil(latencies.length * p) - 1] : null;
  const inputTokens = usable.reduce((sum, row) => sum + (row.inputTokens ?? 0), 0);
  return {
    cases: cases.length, evaluated: results.filter((row) => row.status === "evaluated").length,
    copyExcluded: results.filter((row) => row.status === "copy-excluded").length,
    errors: results.filter((row) => row.status === "error").length,
    ranking, criterion, inputTokens,
    outputTokens: usable.reduce((sum, row) => sum + (row.outputTokens ?? 0), 0),
    estimatedInputCostUsd: inputTokens * INPUT_COST_USD_PER_MILLION / 1_000_000,
    actualCostUsd: null,
    latencyMs: { p50: percentile(0.5), p95: percentile(0.95) },
  };
}

function renderReport(split: Split, summary: ReturnType<typeof metrics>, cases: Case[], results: Result[]): string {
  const lines = [
    `# Rationale quality ${split} result`, "",
    `Rubric: ${RATIONALE_RUBRIC_VERSION}; model requested: ${DEFAULT_MODEL}; scoring: max of three probabilities.`,
    "Ranking uses stable caseId as tie-breaker. Budgets use ceil(n × 10/20/30%). ROC-AUC uses pairwise ties as 0.5.",
    "Criterion FP/FN uses 0.5 only as a diagnostic threshold, not an operational policy.",
    "Copy exclusion is deterministic before provider call. Cost uses the historical harness input-token assumption of $0.042/M; actual billing is unavailable.",
    "", `Cases: ${summary.cases}; evaluated: ${summary.evaluated}; copy excluded: ${summary.copyExcluded}; errors: ${summary.errors}.`,
    `Tokens: input ${summary.inputTokens}, output ${summary.outputTokens}; estimated input cost: $${summary.estimatedInputCostUsd.toFixed(6)}; latency p50/p95: ${summary.latencyMs.p50}/${summary.latencyMs.p95} ms.`, "",
    "| Set | n | positive | AUC | 10% recall / precision / lift | 20% recall / precision / lift | 30% recall / precision / lift |",
    "| --- | ---: | ---: | ---: | --- | --- | --- |",
  ];
  const fmt = (value: number | null) => value === null ? "N/A" : value.toFixed(3);
  for (const [kind, raw] of Object.entries(summary.ranking)) {
    const row = raw as { count: number; positives: number; rocAuc: number | null; budgets: Record<string, { recall: number | null; precision: number | null; liftVsRandom: number | null }> };
    const budget = (percent: string) => [row.budgets[percent].recall, row.budgets[percent].precision, row.budgets[percent].liftVsRandom].map(fmt).join(" / ");
    lines.push(`| ${kind} | ${row.count} | ${row.positives} | ${fmt(row.rocAuc)} | ${budget("10")} | ${budget("20")} | ${budget("30")} |`);
  }
  lines.push("", "| Source | Criterion | gold positives | FP at 0.5 | FN at 0.5 | AUC |", "| --- | --- | ---: | ---: | ---: | ---: |");
  for (const [kind, values] of Object.entries(summary.criterion)) {
    for (const [name, raw] of Object.entries(values)) {
      const row = raw as { positives: number; falsePositive: number; falseNegative: number; rocAuc: number | null };
      lines.push(`| ${kind} | ${name} | ${row.positives} | ${row.falsePositive} | ${row.falseNegative} | ${fmt(row.rocAuc)} |`);
    }
  }
  const byId = new Map(cases.map((candidate) => [candidate.caseId, candidate]));
  lines.push("", "## Case diagnostics", "", "| Case | Source | Gold | Score | Probabilities M/C/S | Status |", "| --- | --- | --- | ---: | --- | --- |");
  for (const result of results) {
    const candidate = byId.get(result.caseId)!;
    const gold = CRITERIA.filter((criterion) => candidate.gold[criterion]).join(",") || "none";
    const probabilities = result.probabilities ? CRITERIA.map((criterion) => fmt(result.probabilities![criterion])).join(" / ") : "N/A";
    lines.push(`| ${result.caseId} | ${result.sourceKind} | ${gold} | ${fmt(result.score ?? null)} | ${probabilities} | ${result.status}${result.errorKind ? `:${result.errorKind}` : ""} |`);
  }
  return lines.join("\n") + "\n";
}

async function run(split: Split): Promise<void> {
  if (split === "holdout") verifyFreeze();
  const apiKey = process.env.TYPESAFE_API_KEY;
  if (!apiKey) throw new Error("TYPESAFE_API_KEY is required for provider evaluation");
  const cases = loadCases().filter((candidate) => candidate.split === split);
  const client = new TypeSafeDirectClient(apiKey);
  const results: Result[] = [];
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const output = path.join(OUTPUT_DIR, `${split}-results.jsonl`);
  for (const candidate of cases) {
    let result: Result;
    if (isExplanationCopy(candidate.rationaleMarkdown, candidate.explanationMarkdown)) {
      result = { caseId: candidate.caseId, sourceKind: candidate.sourceKind, split, status: "copy-excluded",
        probabilities: { choice_rationale_misalignment: 0, choice_rationale_conflict: 0, choice_rationale_shallow: 0 }, score: 0 };
    } else {
      try {
        const { response, latencyMs } = await client.evaluate(stateFor(candidate), RATIONALE_QUESTIONS);
        const probabilities = Object.fromEntries(CRITERIA.map((criterion) => [criterion, response.answers[criterion].noul])) as Record<Criterion, number>;
        result = { caseId: candidate.caseId, sourceKind: candidate.sourceKind, split, status: "evaluated",
          model: response.model, probabilities, score: Math.max(...Object.values(probabilities)),
          inputTokens: response.usage?.input_tokens, outputTokens: response.usage?.output_tokens, latencyMs };
      } catch (error) {
        result = { caseId: candidate.caseId, sourceKind: candidate.sourceKind, split, status: "error",
          errorKind: error instanceof TypeSafeApiError ? error.kind : "API_FAILURE" };
      }
    }
    results.push(result);
    writeFileSync(output, results.map((row) => JSON.stringify(row)).join("\n") + "\n");
    process.stdout.write(`${results.length}/${cases.length} ${candidate.caseId}: ${result.status}\n`);
  }
  const summary = metrics(cases, results);
  writeFileSync(path.join(OUTPUT_DIR, `${split}-metrics.json`), JSON.stringify(summary, null, 2) + "\n");
  writeFileSync(path.join(OUTPUT_DIR, `${split}-report.md`), renderReport(split, summary, cases, results));
  if (summary.errors > 0) throw new Error(`${summary.errors} provider evaluations failed; inspect artifacts`);
}

const command = process.argv[2];
if (command === "validate") {
  const cases = loadCases();
  if (existsSync(FREEZE_PATH)) verifyFreeze();
  console.log(`Validated ${cases.length} rationale cases; freeze hashes: ${JSON.stringify(freezeHashes())}`);
} else if (command === "run") {
  const split = process.argv[3];
  if (split !== "development" && split !== "holdout") throw new Error("Use run development|holdout");
  await run(split);
} else if (command !== undefined) {
  throw new Error("Use validate or run development|holdout");
}
