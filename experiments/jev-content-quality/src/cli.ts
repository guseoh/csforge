import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { calibratePhaseA } from "./calibration.js";
import { loadDataset, loadManifest, DEFAULT_DATASET_PATH, DEFAULT_MANIFEST_PATH } from "./dataset.js";
import { allRubricDefinitions } from "./rubric.js";
import { validateDataset, validateManifest, validateRubric } from "./schema.js";
import { TypeSafeDirectClient, DEFAULT_MODEL } from "./client.js";
import { runBenchmark } from "./runner.js";
import { calculateMetrics } from "./metrics.js";
import { applyThresholdsToResults, type PolicyThresholds } from "./policy.js";
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
    languages: [manifest.primaryInstructionLanguage, "en"],
  });
  const resultsDir = fileURLToPath(new URL("../results", import.meta.url));
  await mkdir(resultsDir, { recursive: true });
  const filePath = path.join(resultsDir, `phase-a-run-${new Date().toISOString().replaceAll(/[:.]/g, "-")}.jsonl`);
  await writeFile(filePath, results.map((result) => JSON.stringify(result)).join("\n") + "\n", "utf8");
  console.log(`BENCHMARK WRITTEN — ${results.length} raw results`);
  console.log(filePath);
  return 0;
}

async function readResults(resultPath: string): Promise<EvaluationResult[]> {
  const raw = await readFile(resultPath, "utf8");
  return raw.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as EvaluationResult);
}

function optionValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function loadThresholds(filePath: string): Promise<PolicyThresholds> {
  const parsed = JSON.parse(await readFile(filePath, "utf8")) as Record<string, unknown>;
  const candidate = parsed.candidateThresholds && typeof parsed.candidateThresholds === "object"
    ? parsed.candidateThresholds as Record<string, unknown>
    : parsed;
  const thresholds: PolicyThresholds = {};
  for (const [id, value] of Object.entries(candidate)) {
    if (value !== null && (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1)) {
      throw new Error(`Invalid threshold for ${id}; expected number in [0, 1] or null`);
    }
    thresholds[id] = value as number | null;
  }
  return thresholds;
}

async function calibrate(resultPath: string): Promise<number> {
  const [dataset, manifest, rawResults] = await Promise.all([loadDataset(), loadManifest(), readResults(resultPath)]);
  const calibration = calibratePhaseA(dataset, rawResults, manifest);
  const resultsDir = fileURLToPath(new URL("../results", import.meta.url));
  await mkdir(resultsDir, { recursive: true });
  const filePath = path.join(resultsDir, `calibration-${new Date().toISOString().replaceAll(/[:.]/g, "-")}.json`);
  await writeFile(filePath, JSON.stringify(calibration, null, 2) + "\n", "utf8");
  console.log("CALIBRATION WRITTEN — Phase A candidate thresholds only");
  console.log(filePath);
  return 0;
}

async function metrics(resultPath: string): Promise<number> {
  const [dataset, manifest, rawResults] = await Promise.all([loadDataset(), loadManifest(), readResults(resultPath)]);
  const thresholdPath = optionValue("--thresholds");
  const results = thresholdPath
    ? applyThresholdsToResults(rawResults, await loadThresholds(thresholdPath))
    : rawResults;
  console.log(JSON.stringify(calculateMetrics(dataset, results, {
    inputCostUsdPerMillionTokens: manifest.estimatedInputCostUsdPerMillionTokens,
    balancedHistoricalSet: manifest.datasetKind === "BALANCED_HISTORICAL_DIAGNOSTIC",
    primaryInstructionLanguage: manifest.primaryInstructionLanguage,
    languageExperimentCaseGroups: new Set(manifest.languageExperimentCaseGroups),
  }), null, 2));
  return 0;
}

const command = process.argv[2];
const inputPath = process.argv[3];
const exitCode = command === "validate"
  ? await validate()
  : command === "benchmark"
    ? await benchmark()
    : command === "calibrate" && inputPath
      ? await calibrate(inputPath)
      : command === "metrics" && inputPath
        ? await metrics(inputPath)
        : (console.error("Usage: npm run validate | npm run benchmark | npm run calibrate -- <raw-result.jsonl> | npm run metrics -- <raw-result.jsonl> [--thresholds <candidate-thresholds.json>]"), 1);
process.exitCode = exitCode;
