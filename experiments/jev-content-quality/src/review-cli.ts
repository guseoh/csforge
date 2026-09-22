import path from "node:path";
import { execFileSync } from "node:child_process";
import { DEFAULT_MODEL, TypeSafeDirectClient } from "./client.js";
import {
  GitRepositoryContentSource,
  selectChangedQuestions,
  selectExplicitQuestions,
  type CandidateSelection,
} from "./review-selection.js";
import {
  DEFAULT_MAX_CANDIDATES,
  assertCandidateLimit,
  assertSuccessfulEvaluation,
  evaluateReviewCandidates,
  requireApiKey,
  validateReviewViewOptions,
  writeReviewArtifacts,
} from "./review-priority.js";

type ReviewMode = "changed" | "explicit";

async function run(): Promise<number> {
  const mode = process.argv[2] as ReviewMode | undefined;
  if (mode !== "changed" && mode !== "explicit") {
    console.error("Usage: review-cli.ts changed [--base=<ref>] [--head=<ref>] | explicit --content-keys=<key1,key2> [--head=<ref>]");
    return 1;
  }

  const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
    cwd: process.cwd(),
    encoding: "utf8",
  }).trim();
  const source = new GitRepositoryContentSource(repositoryRoot);
  const head = optionValue("--head") ?? "HEAD";
  const selection = mode === "changed"
    ? await selectChangedQuestions(source, optionValue("--base") ?? "origin/main", head)
    : await selectExplicitQuestions(source, head, explicitContentKeys());

  printSelection(selection);
  const maxCandidates = integerOption("--max-candidates") ?? DEFAULT_MAX_CANDIDATES;
  assertCandidateLimit(selection.candidates.length, maxCandidates);
  const viewOptions = {
    top: integerOption("--top"),
    topPercent: numberOption("--top-percent"),
    skippedCount: selection.skippedCount,
  };
  validateReviewViewOptions(viewOptions);

  if (hasFlag("--extract-only")) {
    console.log("EVALUATION NOT RUN — extraction only");
    return 0;
  }
  if (selection.candidates.length === 0) {
    console.log("EVALUATION NOT RUN — no eligible changed MULTIPLE_CHOICE Questions");
    return 0;
  }

  const apiKey = requireApiKey(process.env.TYPESAFE_API_KEY);
  const client = new TypeSafeDirectClient(apiKey, DEFAULT_MODEL);
  const results = await evaluateReviewCandidates(selection.candidates, client, DEFAULT_MODEL);
  const outputDirectory = path.resolve(optionValue("--output-dir") ?? "results/review-priority");
  const artifacts = await writeReviewArtifacts(outputDirectory, selection.candidates, results, viewOptions);

  console.log(`RESULT JSONL — ${artifacts.jsonlPath}`);
  console.log(`REVIEW REPORT — ${artifacts.reportPath}`);
  console.log(`REVIEW SUMMARY — ${JSON.stringify(artifacts.summary)}`);
  assertSuccessfulEvaluation(artifacts.summary);
  return 0;
}

function printSelection(selection: CandidateSelection): void {
  console.log(`CANDIDATE COUNT — ${selection.candidates.length}`);
  console.log(`SKIPPED COUNT — ${selection.skippedCount}`);
  for (const candidate of selection.candidates) console.log(`CANDIDATE — ${candidate.contentKey}`);
}

function explicitContentKeys(): string[] {
  const raw = optionValue("--content-keys");
  return raw ? raw.split(",").map((value) => value.trim()).filter(Boolean) : [];
}

function optionValue(name: string): string | undefined {
  const assigned = process.argv.find((argument) => argument.startsWith(`${name}=`));
  if (assigned) return assigned.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function integerOption(name: string): number | undefined {
  const value = optionValue(name);
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) throw new Error(`${name} must be an integer`);
  return parsed;
}

function numberOption(name: string): number | undefined {
  const value = optionValue(name);
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`${name} must be a number`);
  return parsed;
}

try {
  process.exitCode = await run();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
