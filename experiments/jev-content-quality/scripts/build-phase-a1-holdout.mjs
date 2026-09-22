import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const experimentDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryDir = path.resolve(experimentDir, "../..");
const dataDir = path.join(experimentDir, "data");
const specs = JSON.parse(readFileSync(path.join(dataDir, "phase-a1-case-spec.json"), "utf8"));
const datasetVersion = "phase-a1-historical-holdout-2026-09-22";

function gitShow(ref, filePath) {
  return execFileSync("git", ["show", `${ref}:${filePath}`], { cwd: repositoryDir, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
}

function extractContent(spec, ref) {
  const raw = gitShow(ref, spec.path);
  if (spec.kind === "CONCEPT") return { kind: "concept", contentKey: spec.contentKey, markdown: raw };
  const question = JSON.parse(raw).find((candidate) => candidate.contentKey === spec.contentKey);
  if (!question) throw new Error(`${spec.contentKey} is missing at ${ref}:${spec.path}`);
  return question;
}

function questionGold(content, overrides = {}) {
  return {
    materialTechnicalError: false,
    multipleDefensibleAnswers: false,
    weakDistractor: content.questionType === "MULTIPLE_CHOICE" ? false : null,
    ...overrides,
  };
}

function record(spec, version) {
  const ref = version === "BEFORE" ? spec.beforeRef : spec.afterRef;
  const content = extractContent(spec, ref);
  const candidateGold = spec.kind === "CONCEPT"
    ? { materialTechnicalError: version === "BEFORE" ? (spec.beforeGold.materialTechnicalError ?? false) : false }
    : questionGold(content, version === "BEFORE" ? spec.beforeGold : {});
  return {
    datasetVersion,
    caseId: `${spec.id}-${version.toLowerCase()}`,
    caseGroupId: spec.id,
    kind: spec.kind,
    area: spec.area,
    contentKey: spec.contentKey,
    source: {
      sourcePr: spec.pr,
      repositoryRef: "guseoh/csforge",
      path: spec.path,
      beforeRef: spec.beforeRef,
      afterRef: spec.afterRef,
      commit: spec.afterRef,
      version,
    },
    content,
    state: { content, canonicalLanguage: "ko" },
    candidateGoldSeverity: version === "BEFORE" ? spec.beforeSeverity : "NONE",
    candidateGold,
    labelRationale: version === "BEFORE"
      ? spec.rationale
      : `Human-reviewed AFTER counterpart from PR #${spec.pr}; all applicable Rubric V2 criteria are false.`,
  };
}

const rows = specs.flatMap((spec) => [record(spec, "BEFORE"), record(spec, "AFTER")]);
writeFileSync(path.join(dataDir, "phase-a1-holdout.jsonl"), `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`, "utf8");
console.log(`WROTE ${rows.length} rows / ${specs.length} pairs`);
