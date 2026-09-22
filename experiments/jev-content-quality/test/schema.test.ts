import { test } from "node:test";
import assert from "node:assert/strict";
import { HOLDOUT_DATASET_PATH, HOLDOUT_MANIFEST_PATH, loadDataset, loadManifest } from "../src/dataset.js";
import { validateDataset, validateManifest } from "../src/schema.js";

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
  assert.ok(sliding.every((row) => row.candidateGold.materialTechnicalError === false));
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
