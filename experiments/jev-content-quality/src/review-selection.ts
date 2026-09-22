import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const QUESTION_FILE_SUFFIX = "/questions.json";
const ELIGIBLE_STATUSES = new Set(["DRAFT", "PUBLISHED"]);

export interface CanonicalChoice {
  key: string;
  content: string;
  displayOrder: number;
}

export interface CanonicalQuestion extends Record<string, unknown> {
  kind: "question";
  contentKey: string;
  promptMarkdown: string;
  questionType: string;
  status: string;
  choices?: CanonicalChoice[];
  correctChoiceKey?: string;
}

export interface ReviewCandidate {
  contentKey: string;
  area: string;
  sourcePath: string;
  question: CanonicalQuestion;
  state: Record<string, unknown>;
}

export interface CandidateSelection {
  candidates: ReviewCandidate[];
  skippedCount: number;
}

export interface GitContentSource {
  assertRef(ref: string): Promise<void>;
  mergeBase(base: string, head: string): Promise<string>;
  listChangedPaths(base: string, head: string): Promise<string[]>;
  listQuestionPaths(ref: string): Promise<string[]>;
  readFileAtRef(ref: string, filePath: string): Promise<string | undefined>;
}

export class GitRepositoryContentSource implements GitContentSource {
  constructor(private readonly repositoryRoot: string) {}

  async assertRef(ref: string): Promise<void> {
    await this.git(["rev-parse", "--verify", `${ref}^{commit}`]);
  }

  async mergeBase(base: string, head: string): Promise<string> {
    return (await this.git(["merge-base", base, head])).trim();
  }

  async listChangedPaths(base: string, head: string): Promise<string[]> {
    const stdout = await this.git(["diff", "--name-only", "--diff-filter=ACMR", base, head, "--", ":(top)content"]);
    return lines(stdout).map(normalizePath);
  }

  async listQuestionPaths(ref: string): Promise<string[]> {
    const stdout = await this.git(["ls-tree", "-r", "--name-only", ref, "--", ":(top)content"]);
    return lines(stdout).map(normalizePath).filter(isQuestionPath).sort();
  }

  async readFileAtRef(ref: string, filePath: string): Promise<string | undefined> {
    try {
      return await this.git(["show", `${ref}:${filePath}`]);
    } catch (error) {
      const stderr = typeof error === "object" && error !== null && "stderr" in error
        ? String(error.stderr)
        : "";
      if (/does not exist in|exists on disk, but not in/i.test(stderr)) return undefined;
      throw error;
    }
  }

  private async git(args: string[]): Promise<string> {
    const { stdout } = await execFileAsync("git", ["-C", this.repositoryRoot, ...args], {
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    });
    return stdout;
  }
}

export async function selectChangedQuestions(
  source: GitContentSource,
  base: string,
  head: string,
): Promise<CandidateSelection> {
  await Promise.all([source.assertRef(base), source.assertRef(head)]);
  const comparisonBase = await source.mergeBase(base, head);
  const changedPaths = (await source.listChangedPaths(comparisonBase, head)).filter(isQuestionPath).sort();
  const candidates: ReviewCandidate[] = [];
  let skippedCount = 0;

  for (const sourcePath of changedPaths) {
    const [baseQuestions, headQuestions] = await Promise.all([
      readQuestions(source, comparisonBase, sourcePath),
      readQuestions(source, head, sourcePath),
    ]);
    const beforeByKey = new Map(baseQuestions.map((question) => [question.contentKey, question]));
    const afterByKey = new Map(headQuestions.map((question) => [question.contentKey, question]));
    const keys = [...new Set([...beforeByKey.keys(), ...afterByKey.keys()])].sort();

    for (const contentKey of keys) {
      const before = beforeByKey.get(contentKey);
      const after = afterByKey.get(contentKey);
      if (before && after && canonicalJson(before) === canonicalJson(after)) continue;
      if (!after || !isEligibleMultipleChoice(after) || (before && reviewRelevantJson(before) === reviewRelevantJson(after))) {
        skippedCount += 1;
        continue;
      }
      validateReviewQuestion(after, sourcePath);
      candidates.push(toCandidate(after, sourcePath));
    }
  }

  return { candidates: uniqueSortedCandidates(candidates), skippedCount };
}

export async function selectExplicitQuestions(
  source: GitContentSource,
  head: string,
  contentKeys: readonly string[],
): Promise<CandidateSelection> {
  await source.assertRef(head);
  const requested = [...new Set(contentKeys.map((key) => key.trim()).filter(Boolean))].sort();
  if (requested.length === 0) throw new Error("Explicit selection requires at least one contentKey");

  const requestedSet = new Set(requested);
  const found = new Map<string, ReviewCandidate>();
  const questionFiles = await mapConcurrent(await source.listQuestionPaths(head), 8, async (sourcePath) => ({
    sourcePath,
    questions: await readQuestions(source, head, sourcePath),
  }));
  for (const { sourcePath, questions } of questionFiles) {
    for (const question of questions) {
      if (!requestedSet.has(question.contentKey)) continue;
      if (!isEligibleMultipleChoice(question)) {
        throw new Error(`Explicit Question is not an eligible MULTIPLE_CHOICE candidate: ${question.contentKey}`);
      }
      validateReviewQuestion(question, sourcePath);
      if (found.has(question.contentKey)) throw new Error(`Duplicate canonical contentKey: ${question.contentKey}`);
      found.set(question.contentKey, toCandidate(question, sourcePath));
    }
  }

  const missing = requested.filter((key) => !found.has(key));
  if (missing.length > 0) throw new Error(`Explicit contentKey not found: ${missing.join(", ")}`);
  return { candidates: requested.map((key) => found.get(key)!), skippedCount: 0 };
}

async function mapConcurrent<T, R>(
  values: readonly T[],
  concurrency: number,
  operation: (value: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(values.length);
  let nextIndex = 0;
  async function worker(): Promise<void> {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await operation(values[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, () => worker()));
  return results;
}

function lines(value: string): string[] {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function normalizePath(value: string): string {
  return value.replaceAll("\\", "/");
}

function isQuestionPath(value: string): boolean {
  return normalizePath(value).startsWith("content/") && normalizePath(value).endsWith(QUESTION_FILE_SUFFIX);
}

async function readQuestions(source: GitContentSource, ref: string, sourcePath: string): Promise<CanonicalQuestion[]> {
  const raw = await source.readFileAtRef(ref, sourcePath);
  if (raw === undefined) return [];
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) throw new Error(`${sourcePath} at ${ref} must contain a JSON array`);
  const questions = parsed.map((value, index) => parseQuestion(value, `${sourcePath}[${index}]`));
  const keys = questions.map((question) => question.contentKey);
  if (new Set(keys).size !== keys.length) throw new Error(`${sourcePath} at ${ref} contains duplicate contentKey values`);
  return questions;
}

function parseQuestion(value: unknown, location: string): CanonicalQuestion {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(`${location} must be an object`);
  const question = value as Record<string, unknown>;
  if (question.kind !== "question" || typeof question.contentKey !== "string") {
    throw new Error(`${location} must be a canonical Question with contentKey`);
  }
  return question as CanonicalQuestion;
}

function isEligibleMultipleChoice(question: CanonicalQuestion): boolean {
  return question.questionType === "MULTIPLE_CHOICE"
    && ELIGIBLE_STATUSES.has(question.status)
    && Array.isArray(question.choices)
    && question.choices.length > 0;
}

function validateReviewQuestion(question: CanonicalQuestion, sourcePath: string): void {
  if (typeof question.promptMarkdown !== "string" || question.promptMarkdown.trim().length === 0) {
    throw new Error(`${question.contentKey} in ${sourcePath} has no Question prompt`);
  }
  if (!Array.isArray(question.choices) || question.choices.length < 2) {
    throw new Error(`${question.contentKey} in ${sourcePath} must have at least two choices`);
  }
  const choiceKeys = new Set<string>();
  for (const [index, choice] of question.choices.entries()) {
    if (typeof choice !== "object" || choice === null
      || typeof choice.key !== "string" || choice.key.length === 0
      || typeof choice.content !== "string" || choice.content.trim().length === 0
      || !Number.isInteger(choice.displayOrder)) {
      throw new Error(`${question.contentKey} in ${sourcePath} has an invalid choice at index ${index}`);
    }
    if (choiceKeys.has(choice.key)) throw new Error(`${question.contentKey} in ${sourcePath} has duplicate choice key ${choice.key}`);
    choiceKeys.add(choice.key);
  }
  if (typeof question.correctChoiceKey !== "string" || !choiceKeys.has(question.correctChoiceKey)) {
    throw new Error(`${question.contentKey} in ${sourcePath} has an invalid correctChoiceKey`);
  }
}

function toCandidate(question: CanonicalQuestion, sourcePath: string): ReviewCandidate {
  return {
    contentKey: question.contentKey,
    area: question.contentKey.split(".")[0],
    sourcePath,
    question,
    state: { content: question, canonicalLanguage: "ko" },
  };
}

function uniqueSortedCandidates(candidates: ReviewCandidate[]): ReviewCandidate[] {
  const byKey = new Map<string, ReviewCandidate>();
  for (const candidate of candidates) {
    if (byKey.has(candidate.contentKey)) throw new Error(`Duplicate canonical contentKey: ${candidate.contentKey}`);
    byKey.set(candidate.contentKey, candidate);
  }
  return [...byKey.values()].sort((left, right) => left.contentKey.localeCompare(right.contentKey));
}

function reviewRelevantJson(question: CanonicalQuestion): string {
  return canonicalJson({
    questionType: question.questionType,
    promptMarkdown: question.promptMarkdown,
    choices: question.choices,
    correctChoiceKey: question.correctChoiceKey,
  });
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (typeof value === "object" && value !== null) {
    return `{${Object.entries(value).sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}
