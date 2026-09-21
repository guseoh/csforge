import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadDataset, loadManifest, DEFAULT_DATASET_PATH, DEFAULT_MANIFEST_PATH } from "./dataset.js";
import { allRubricDefinitions } from "./rubric.js";
import { validateDataset, validateManifest, validateRubric } from "./schema.js";
import { TypeSafeDirectClient, DEFAULT_MODEL } from "./client.js";
import { runBenchmark } from "./runner.js";
import { calculateMetrics } from "./metrics.js";
import type { EvaluationResult } from "./types.js";

async function validate(): Promise<number> {
  const [dataset, manifest] = await Promise.all([loadDataset(DEFAULT_DATASET_PATH), loadManifest(DEFAULT_MANIFEST_PATH)]);
  const errors = [...validateDataset(dataset), ...validateRubric(allRubricDefinitions()), ...validateManifest(manifest, dataset)];
  if (dataset.length !== manifest.rowCount) errors.push(`manifest rowCount=${manifest.rowCount}, actual=${dataset.length}`);
  const groupCount = new Set(dataset.map((row) => row.caseGroupId)).size;
  if (groupCount !== manifest.caseGroupCount) errors.push(`manifest caseGroupCount=${manifest.caseGroupCount}, actual=${groupCount}`);
  if (errors.length > 0) {
    console.error(errors.join("\n"));
    return 1;
  }
  console.log(`DATASET VALID — ${dataset.length} rows / ${groupCount} paired case groups`);
  console.log(`RUBRIC VALID — ${allRubricDefinitions().reduce((sum, definition) => sum + Object.keys(definition.questions).length, 0)} language-specific atomic questions`);
  return 0;
}

function thresholdsFromEnvironment(): Record<string, number> | undefined {
  const raw = process.env.JEV_POLICY_THRESHOLDS_JSON;
  if (!raw) return undefined;
  const parsed = JSON.parse(raw) as Record<string, number>;
  return parsed;
}

async function benchmark(): Promise<number> {
  console.log("HARNESS READY");
  const apiKey = process.env.TYPESAFE_API_KEY;
  if (!apiKey) {
    console.log("BENCHMARK NOT RUN — TYPESAFE_API_KEY unavailable");
    return 0;
  }
  const [dataset, manifest] = await Promise.all([loadDataset(), loadManifest()]);
  const client = new TypeSafeDirectClient(apiKey, DEFAULT_MODEL);
  const results = await runBenchmark({
    dataset,
    client,
    requestedModel: manifest.model,
    datasetVersion: manifest.datasetVersion,
    languageExperimentCaseGroups: new Set(manifest.languageExperimentCaseGroups),
    languages: ["ko", "en"],
    thresholds: thresholdsFromEnvironment(),
  });
  const resultsDir = fileURLToPath(new URL("../results", import.meta.url));
  await mkdir(resultsDir, { recursive: true });
  const filePath = path.join(resultsDir, `phase-a-run-${new Date().toISOString().replaceAll(/[:.]/g, "-")}.jsonl`);
  await writeFile(filePath, results.map((result) => JSON.stringify(result)).join("\n") + "\n", "utf8");
  console.log(`BENCHMARK WRITTEN — ${results.length} results`);
  console.log(filePath);
  return 0;
}

async function metrics(resultPath: string): Promise<number> {
  const dataset = await loadDataset();
  const raw = await readFile(resultPath, "utf8");
  const results = raw.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as EvaluationResult);
  const manifest = await loadManifest();
  console.log(JSON.stringify(calculateMetrics(dataset, results, { inputCostUsdPerMillionTokens: manifest.estimatedInputCostUsdPerMillionTokens, balancedHistoricalSet: manifest.datasetKind === "BALANCED_HISTORICAL_DIAGNOSTIC" }), null, 2));
  return 0;
}

const command = process.argv[2];
const exitCode = command === "validate"
  ? await validate()
  : command === "benchmark"
    ? await benchmark()
    : command === "metrics" && process.argv[3]
      ? await metrics(process.argv[3])
      : (console.error("Usage: npm run validate | npm run benchmark | npm run metrics -- <result.jsonl>"), 1);
process.exitCode = exitCode;
