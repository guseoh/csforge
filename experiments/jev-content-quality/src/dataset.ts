import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import type { CandidateRecord } from "./types.js";

export const DATA_DIR = fileURLToPath(new URL("../data", import.meta.url));
export const DEFAULT_DATASET_PATH = path.join(DATA_DIR, "phase-a-candidates.jsonl");
export const DEFAULT_MANIFEST_PATH = path.join(DATA_DIR, "manifest.json");
export const HOLDOUT_DATASET_PATH = path.join(DATA_DIR, "phase-a1-holdout.jsonl");
export const HOLDOUT_MANIFEST_PATH = path.join(DATA_DIR, "phase-a1-manifest.json");
export const WEAK_HOLDOUT_DATASET_PATH = path.join(DATA_DIR, "phase-a2-weak-distractor-holdout.jsonl");
export const WEAK_HOLDOUT_MANIFEST_PATH = path.join(DATA_DIR, "phase-a2-manifest.json");
export const FROZEN_HISTORICAL_HOLDOUT = "FROZEN_HISTORICAL_HOLDOUT";
export const FROZEN_WEAK_DISTRACTOR_HOLDOUT = "FROZEN_WEAK_DISTRACTOR_HOLDOUT";

export function isFrozenHoldoutDatasetKind(datasetKind: string | undefined): boolean {
  return datasetKind === FROZEN_HISTORICAL_HOLDOUT || datasetKind === FROZEN_WEAK_DISTRACTOR_HOLDOUT;
}

export function assertThresholdedMetricsAllowed(datasetKind: string | undefined, hasThresholds: boolean): void {
  if (hasThresholds && isFrozenHoldoutDatasetKind(datasetKind)) {
    throw new Error("Frozen holdout metrics must remain raw and UNCALIBRATED; thresholds are not allowed");
  }
}

export interface CriterionSupport {
  positiveSupport: number;
  negativeSupport?: number;
  applicableSupport?: number;
  recallEvaluable: boolean;
  note?: string;
}

export interface DatasetManifest {
  datasetVersion: string;
  rubricVersion: string;
  model: string;
  datasetKind: string;
  primaryInstructionLanguage: "ko" | "en";
  rowCount: number;
  caseGroupCount: number;
  languageExperimentCaseGroups: string[];
  requestedCriteria?: string[];
  estimatedInputCostUsdPerMillionTokens: number;
  criterionSupport: {
    question: Record<string, CriterionSupport>;
    concept: Record<string, CriterionSupport>;
  };
  difficultyFitDistribution?: Record<string, number>;
  holdoutPairCount?: number;
  phaseADatasetVersion?: string;
  phaseAContentKeys?: string[];
  phaseA1DatasetVersion?: string;
  phaseA1ContentKeys?: string[];
  sourcePrsSelected?: number[];
  learningAreaCount?: number;
  droppedCandidates?: Array<{ contentKey: string; rationale: string }>;
  independenceStatement?: string;
  notes?: string[];
}

export async function loadDataset(filePath = DEFAULT_DATASET_PATH): Promise<CandidateRecord[]> {
  const raw = await readFile(filePath, "utf8");
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line) as CandidateRecord;
      } catch (error) {
        throw new Error(`Invalid JSONL at line ${index + 1}: ${String(error)}`);
      }
    });
}

export async function loadManifest(filePath = DEFAULT_MANIFEST_PATH): Promise<DatasetManifest> {
  return JSON.parse(await readFile(filePath, "utf8")) as DatasetManifest;
}
