import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const experimentDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryDir = path.resolve(experimentDir, "../..");
const dataDir = path.join(experimentDir, "data");
const specs = JSON.parse(readFileSync(path.join(dataDir, "phase-a2-case-spec.json"), "utf8"));
const datasetVersion = "phase-a2-weak-distractor-holdout-2026-09-22";

function extractQuestion(spec, ref) {
  const raw = execFileSync("git", ["show", `${ref}:${spec.path}`], {
    cwd: repositoryDir,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  const question = JSON.parse(raw).find((candidate) => candidate.contentKey === spec.contentKey);
  if (!question) throw new Error(`${spec.contentKey} is missing at ${ref}:${spec.path}`);
  if (question.questionType !== "MULTIPLE_CHOICE") throw new Error(`${spec.contentKey} is not MULTIPLE_CHOICE at ${ref}`);
  return question;
}

function record(spec, version) {
  const ref = version === "BEFORE" ? spec.beforeRef : spec.afterRef;
  const content = extractQuestion(spec, ref);
  const weakDistractor = version === "BEFORE" && spec.positive;
  return {
    datasetVersion,
    caseId: `${spec.id}-${version.toLowerCase()}`,
    caseGroupId: spec.id,
    kind: "QUESTION",
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
    candidateGoldSeverity: weakDistractor ? "P1" : "NONE",
    candidateGold: { weakDistractor },
    labelRationale: version === "BEFORE"
      ? spec.rationale
      : `Human-reviewed AFTER counterpart from PR #${spec.pr}; weakDistractor=false with NONE severity.`,
  };
}

const rows = specs.flatMap((spec) => [record(spec, "BEFORE"), record(spec, "AFTER")]);
writeFileSync(path.join(dataDir, "phase-a2-weak-distractor-holdout.jsonl"), `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`, "utf8");
console.log(`WROTE ${rows.length} rows / ${specs.length} pairs`);
