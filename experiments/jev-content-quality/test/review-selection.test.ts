import assert from "node:assert/strict";
import test from "node:test";
import {
  selectChangedQuestions,
  selectExplicitQuestions,
  type CanonicalQuestion,
  type GitContentSource,
} from "../src/review-selection.js";

const PATH_A = "content/java/topic-a/questions.json";
const PATH_B = "content/spring/topic-b/questions.json";

class FakeGitContentSource implements GitContentSource {
  constructor(
    private readonly files: Record<string, Record<string, string>>,
    private readonly changedPaths: string[],
  ) {}

  async assertRef(ref: string): Promise<void> {
    if (!this.files[ref]) throw new Error(`Unknown ref ${ref}`);
  }

  async listChangedPaths(): Promise<string[]> {
    return this.changedPaths;
  }

  async listQuestionPaths(ref: string): Promise<string[]> {
    return Object.keys(this.files[ref]).filter((filePath) => filePath.endsWith("/questions.json"));
  }

  async readFileAtRef(ref: string, filePath: string): Promise<string | undefined> {
    return this.files[ref][filePath];
  }
}

test("changed mode selects only meaningfully changed MC Questions and ignores Concept-only changes", async () => {
  const unchanged = question("java.core.topic.unchanged", "same", "MULTIPLE_CHOICE");
  const changedBefore = question("java.core.topic.changed", "old prompt", "MULTIPLE_CHOICE");
  const changedAfter = question("java.core.topic.changed", "new prompt", "MULTIPLE_CHOICE");
  const nonMcBefore = question("java.core.topic.short", "old", "SHORT_ANSWER");
  const nonMcAfter = question("java.core.topic.short", "new", "SHORT_ANSWER");
  const source = new FakeGitContentSource({
    base: {
      [PATH_A]: JSON.stringify([unchanged, changedBefore, nonMcBefore]),
      "content/java/topic-a/concept.md": "old",
    },
    head: {
      [PATH_A]: JSON.stringify([unchanged, changedAfter, nonMcAfter], null, 2),
      "content/java/topic-a/concept.md": "new",
    },
  }, ["content/java/topic-a/concept.md", PATH_A]);

  const selected = await selectChangedQuestions(source, "base", "head");

  assert.deepEqual(selected.candidates.map((candidate) => candidate.contentKey), ["java.core.topic.changed"]);
  assert.equal(selected.candidates[0].sourcePath, PATH_A);
  assert.equal(selected.skippedCount, 1);
});

test("changed mode excludes formatting-only and unrelated Question field changes", async () => {
  const before = question("java.core.topic.q1", "same", "MULTIPLE_CHOICE");
  const after = { ...before, explanationMarkdown: "changed explanation only" };
  const source = new FakeGitContentSource({
    base: { [PATH_A]: JSON.stringify([before]) },
    head: { [PATH_A]: JSON.stringify([after], null, 4) },
  }, [PATH_A]);

  const selected = await selectChangedQuestions(source, "base", "head");

  assert.deepEqual(selected.candidates, []);
  assert.equal(selected.skippedCount, 1);
});

test("changed candidates are deterministically ordered before provider use", async () => {
  const z = question("spring.core.topic.z", "new", "MULTIPLE_CHOICE");
  const a = question("java.core.topic.a", "new", "MULTIPLE_CHOICE");
  const source = new FakeGitContentSource({
    base: { [PATH_A]: "[]", [PATH_B]: "[]" },
    head: { [PATH_A]: JSON.stringify([a]), [PATH_B]: JSON.stringify([z]) },
  }, [PATH_B, PATH_A]);

  const selected = await selectChangedQuestions(source, "base", "head");

  assert.deepEqual(selected.candidates.map((candidate) => candidate.contentKey), [
    "java.core.topic.a",
    "spring.core.topic.z",
  ]);
});

test("explicit mode selects the requested MC contentKeys in stable order", async () => {
  const first = question("java.core.topic.a", "first", "MULTIPLE_CHOICE");
  const second = question("spring.core.topic.z", "second", "MULTIPLE_CHOICE");
  const ignored = question("java.core.topic.short", "short", "SHORT_ANSWER");
  const source = new FakeGitContentSource({
    head: { [PATH_A]: JSON.stringify([ignored, first]), [PATH_B]: JSON.stringify([second]) },
  }, []);

  const selected = await selectExplicitQuestions(source, "head", [second.contentKey, first.contentKey, second.contentKey]);

  assert.deepEqual(selected.candidates.map((candidate) => candidate.contentKey), [first.contentKey, second.contentKey]);
  assert.equal(selected.skippedCount, 0);
});

function question(contentKey: string, promptMarkdown: string, questionType: string): CanonicalQuestion {
  return {
    kind: "question",
    contentKey,
    promptMarkdown,
    questionType,
    difficulty: "EASY",
    status: "PUBLISHED",
    conceptKeys: [contentKey.replace(/\.q\d+$/, "")],
    ...(questionType === "MULTIPLE_CHOICE" ? {
      choices: [
        { key: "A", content: "first", displayOrder: 0 },
        { key: "B", content: "second", displayOrder: 1 },
      ],
      correctChoiceKey: "A",
    } : { acceptedAnswers: ["answer"] }),
    explanationMarkdown: "explanation",
  };
}
