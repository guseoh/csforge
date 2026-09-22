import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { calibratePhaseA } from "./calibration.js";
import {
  DEFAULT_DATASET_PATH,
  DEFAULT_MANIFEST_PATH,
  HOLDOUT_DATASET_PATH,
  HOLDOUT_MANIFEST_PATH,
  WEAK_HOLDOUT_DATASET_PATH,
  WEAK_HOLDOUT_MANIFEST_PATH,
  assertThresholdedMetricsAllowed,
  isFrozenHoldoutDatasetKind,
  loadDataset,
  loadManifest,
  type DatasetManifest,
} from "./dataset.js";
import { allRubricDefinitions } from "./rubric.js";
import { validateDataset, validateManifest, validateRubric } from "./schema.js";
import { TypeSafeDirectClient } from "./client.js";
import { runBenchmark } from "./runner.js";
import { calculateMetrics } from "./metrics.js";
import { applyThresholdsToResults, type PolicyThresholds } from "./policy.js";
import type { CandidateRecord, EvaluationResult } from "./types.js";

interface DatasetProfile {
  datasetPath: string;
  manifestPath: string;
  outputPrefix: string;
}

const PHASE_A: DatasetProfile = {
  datasetPath: DEFAULT_DATASET_PATH,
  manifestPath: DEFAULT_MANIFEST_PATH,
  outputPrefix: "phase-a",
};
const PHASE_A1: DatasetProfile = {
  datasetPath: HOLDOUT_DATASET_PATH,
  manifestPath: HOLDOUT_MANIFEST_PATH,
  outputPrefix: "phase-a1-holdout",
};
const PHASE_A2: DatasetProfile = {
  datasetPath: WEAK_HOLDOUT_DATASET_PATH,
  manifestPath: WEAK_HOLDOUT_MANIFEST_PATH,
  outputPrefix: "phase-a2-weak-holdout",
};

async function loadProfile(profile: DatasetProfile): Promise<{ dataset: CandidateRecord[]; manifest: DatasetManifest }> {
  const [dataset, manifest] = await Promise.all([loadDataset(profile.datasetPath), loadManifest(profile.manifestPath)]);
  return { dataset, manifest };
}

async function validateProfile(
  profile: DatasetProfile,
  phaseARows: CandidateRecord[],
  phaseA1Rows: CandidateRecord[] = [],
): Promise<string[]> {
  const { dataset, manifest } = await loadProfile(profile);
  const errors = [
    ...validateDataset(dataset, manifest),
    ...validateRubric(allRubricDefinitions(manifest.rubricVersion)),
    ...validateManifest(manifest, dataset, phaseARows, phaseA1Rows),
  ];
  if (dataset.length !== manifest.rowCount) errors.push(`${manifest.datasetVersion}: manifest rowCount=${manifest.rowCount}, actual=${dataset.length}`);
  const groupCount = new Set(dataset.map((row) => row.caseGroupId)).size;
  if (groupCount !== manifest.caseGroupCount) errors.push(`${manifest.datasetVersion}: manifest caseGroupCount=${manifest.caseGroupCount}, actual=${groupCount}`);
  if (errors.length === 0) {
    console.log(`DATASET VALID — ${manifest.datasetVersion}: ${dataset.length} rows / ${groupCount} paired case groups`);
    console.log(`RUBRIC VALID — ${manifest.rubricVersion}`);
  }
  return errors;
}

async function validate(): Promise<number> {
  const [phaseARows, phaseA1Rows] = await Promise.all([
    loadDataset(DEFAULT_DATASET_PATH),
    loadDataset(HOLDOUT_DATASET_PATH),
  ]);
  const errors = [
    ...await validateProfile(PHASE_A, phaseARows),
    ...await validateProfile(PHASE_A1, phaseARows),
    ...await validateProfile(PHASE_A2, phaseARows, phaseA1Rows),
  ];
  if (errors.length > 0) {
    console.error(errors.join("\n"));
    return 1;
  }
  return 0;
}

async function benchmark(profile: DatasetProfile): Promise<number> {
  console.log("HARNESS READY");
  const apiKey = process.env.TYPESAFE_API_KEY;
  if (!apiKey) {
    console.log("BENCHMARK NOT RUN — TYPESAFE_API_KEY unavailable");
    return 0;
  }
  const { dataset, manifest } = await loadProfile(profile);
  const client = new TypeSafeDirectClient(apiKey, manifest.model);
  const results = await runBenchmark({
    dataset,
    client,
    requestedModel: manifest.model,
    datasetVersion: manifest.datasetVersion,
    datasetKind: manifest.datasetKind,
    rubricVersion: manifest.rubricVersion,
    requestedCriteria: manifest.requestedCriteria,
    languageExperimentCaseGroups: new Set(manifest.languageExperimentCaseGroups),
    languages: [manifest.primaryInstructionLanguage, "en"],
  });
  const resultsDir = fileURLToPath(new URL("../results", import.meta.url));
  await mkdir(resultsDir, { recursive: true });
  const filePath = path.join(resultsDir, `${profile.outputPrefix}-run-${new Date().toISOString().replaceAll(/[:.]/g, "-")}.jsonl`);
  await writeFile(filePath, results.map((result) => JSON.stringify(result)).join("\n") + "\n", "utf8");
  console.log(`BENCHMARK WRITTEN — ${results.length} raw UNCALIBRATED results`);
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

function isFrozenHoldout(results: EvaluationResult[]): boolean {
  return results.some((result) => isFrozenHoldoutDatasetKind(result.datasetKind)
    || result.datasetVersion === "phase-a1-historical-holdout-2026-09-22"
    || result.datasetVersion === "phase-a2-weak-distractor-holdout-2026-09-22");
}

function profileForResults(results: EvaluationResult[]): DatasetProfile {
  if (results.some((result) => result.datasetVersion === "phase-a2-weak-distractor-holdout-2026-09-22")) return PHASE_A2;
  if (isFrozenHoldout(results)) return PHASE_A1;
  return PHASE_A;
}

async function calibrate(resultPath: string): Promise<number> {
  const rawResults = await readResults(resultPath);
  if (isFrozenHoldout(rawResults)) throw new Error("FROZEN_HISTORICAL_HOLDOUT cannot be used for threshold calibration");
  const { dataset, manifest } = await loadProfile(PHASE_A);
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
  const rawResults = await readResults(resultPath);
  const frozen = isFrozenHoldout(rawResults);
  const { dataset, manifest } = await loadProfile(profileForResults(rawResults));
  const thresholdPath = optionValue("--thresholds");
  assertThresholdedMetricsAllowed(frozen ? manifest.datasetKind : undefined, Boolean(thresholdPath));
  const results = thresholdPath ? applyThresholdsToResults(rawResults, await loadThresholds(thresholdPath)) : rawResults;
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
    ? await benchmark(PHASE_A)
    : command === "benchmark-holdout"
      ? await benchmark(PHASE_A1)
      : command === "benchmark-weak-holdout"
        ? await benchmark(PHASE_A2)
      : command === "calibrate" && inputPath
        ? await calibrate(inputPath)
        : command === "metrics" && inputPath
          ? await metrics(inputPath)
          : (console.error("Usage: npm run validate | npm run benchmark | npm run benchmark:holdout | npm run benchmark:weak-holdout | npm run calibrate -- <phase-a-raw-result.jsonl> | npm run metrics -- <raw-result.jsonl> [--thresholds <phase-a-thresholds.json>]"), 1);
process.exitCode = exitCode;
