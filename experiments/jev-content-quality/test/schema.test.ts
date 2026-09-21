import { test } from "node:test";
import assert from "node:assert/strict";
import { loadDataset, loadManifest } from "../src/dataset.js";
import { validateManifest } from "../src/schema.js";

test("manifest case groups and criterion support match the dataset", async () => {
  const [dataset, manifest] = await Promise.all([loadDataset(), loadManifest()]);
  assert.deepEqual(validateManifest(manifest, dataset), []);
});
