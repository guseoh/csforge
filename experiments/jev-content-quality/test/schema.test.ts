import { test } from "node:test";
import assert from "node:assert/strict";
import {
  HOLDOUT_DATASET_PATH,
  HOLDOUT_MANIFEST_PATH,
  WEAK_HOLDOUT_DATASET_PATH,
  WEAK_HOLDOUT_MANIFEST_PATH,
  loadDataset,
  loadManifest,
} from "../src/dataset.js";
import { validateDataset, validateManifest } from "../src/schema.js";
import type { CandidateRecord } from "../src/types.js";

test("manifest case groups and criterion support match the dataset", async () => {
  const [dataset, manifest] = await Promise.all([loadDataset(), loadManifest()]);
  assert.deepEqual(validateManifest(manifest, dataset), []);
});

test("frozen holdout has 21 independent pairs with consistent metadata", async () => {
  const [phaseA, holdout, manifest] = await Promise.all([
    loadDataset(),
    loadDataset(HOLDOUT_DATASET_PATH),
    loadManifest(HOLDOUT_MANIFEST_PATH),
  ]);
  assert.equal(holdout.length, 42);
  assert.equal(new Set(holdout.map((row) => row.caseGroupId)).size, 21);
  assert.deepEqual(validateDataset(holdout, manifest), []);
  assert.deepEqual(validateManifest(manifest, holdout, phaseA), []);
  assert.equal(holdout.some((row) => phaseA.some((phaseARow) => phaseARow.contentKey === row.contentKey)), false);
});

test("sliding-window is negative and dropped proposal candidates are absent", async () => {
  const holdout = await loadDataset(HOLDOUT_DATASET_PATH);
  const sliding = holdout.filter((row) => row.contentKey === "network-http.core.tcp.sliding-window");
  assert.equal(sliding.length, 2);
  assert.ok(sliding.every((row) => (row.candidateGold as { materialTechnicalError: boolean }).materialTechnicalError === false));
  assert.equal(holdout.some((row) => row.contentKey === "database.core.mvcc.versions"), false);
  assert.equal(holdout.some((row) => row.contentKey === "network-http.core.tcp.three-way-handshake"), false);
});

test("holdout weakDistractor Gold applies only to MULTIPLE_CHOICE", async () => {
  const holdout = await loadDataset(HOLDOUT_DATASET_PATH);
  for (const row of holdout.filter((candidate) => candidate.kind === "QUESTION")) {
    const weakDistractor = (row.candidateGold as unknown as { weakDistractor: boolean | null }).weakDistractor;
    assert.equal(typeof weakDistractor === "boolean", row.content.questionType === "MULTIPLE_CHOICE");
  }
});

test("Phase A.2 frozen weak holdout satisfies the finalized 40-row contract", async () => {
  const [phaseA, phaseA1, phaseA2, manifest] = await Promise.all([
    loadDataset(),
    loadDataset(HOLDOUT_DATASET_PATH),
    loadDataset(WEAK_HOLDOUT_DATASET_PATH),
    loadManifest(WEAK_HOLDOUT_MANIFEST_PATH),
  ]);
  assert.equal(phaseA2.length, 40);
  assert.equal(new Set(phaseA2.map((row) => row.caseGroupId)).size, 20);
  assert.ok(phaseA2.every((row) => row.kind === "QUESTION" && row.content.questionType === "MULTIPLE_CHOICE"));
  assert.deepEqual(manifest.requestedCriteria, ["weak_distractor"]);
  assert.deepEqual(validateDataset(phaseA2, manifest), []);
  assert.deepEqual(validateManifest(manifest, phaseA2, phaseA, phaseA1), []);

  const beforeRows = phaseA2.filter((row) => row.source.version === "BEFORE");
  const afterRows = phaseA2.filter((row) => row.source.version === "AFTER");
  const weakGold = (row: CandidateRecord): boolean => (row.candidateGold as { weakDistractor: boolean }).weakDistractor;
  assert.equal(beforeRows.filter((row) => weakGold(row) === true).length, 10);
  assert.equal(phaseA2.filter((row) => weakGold(row) === false).length, 30);
  assert.ok(afterRows.every((row) => weakGold(row) === false && row.candidateGoldSeverity === "NONE"));
  assert.ok(beforeRows.filter((row) => weakGold(row) === false)
    .every((row) => row.candidateGoldSeverity === "NONE"));
});

test("Phase A.2 overlap audit rejects Phase A and Phase A.1 content keys", async () => {
  const [phaseA, phaseA1, phaseA2, manifest] = await Promise.all([
    loadDataset(),
    loadDataset(HOLDOUT_DATASET_PATH),
    loadDataset(WEAK_HOLDOUT_DATASET_PATH),
    loadManifest(WEAK_HOLDOUT_MANIFEST_PATH),
  ]);
  const phaseAOverlap = phaseA2.map((row, index) => index < 2 ? { ...row, contentKey: phaseA[0].contentKey } : row);
  assert.match(validateManifest(manifest, phaseAOverlap, phaseA, phaseA1).join("\n"), /overlaps Phase A contentKey/);
  const phaseA1Overlap = phaseA2.map((row, index) => index < 2 ? { ...row, contentKey: phaseA1[0].contentKey } : row);
  assert.match(validateManifest(manifest, phaseA1Overlap, phaseA, phaseA1).join("\n"), /overlaps Phase A\.1 contentKey/);
});
