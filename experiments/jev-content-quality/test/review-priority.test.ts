import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import type { ReviewCandidate } from "../src/review-selection.js";
import {
  assertCandidateLimit,
  evaluateReviewCandidates,
  requireApiKey,
  writeReviewArtifacts,
  type ReviewPriorityClient,
} from "../src/review-priority.js";
import type { JevResponse, RubricQuestion } from "../src/types.js";

test("evaluation calls candidates in stable order and report ranks by probability", async () => {
  const calls: string[] = [];
  const client: ReviewPriorityClient = {
    async evaluate(state, questions) {
      assert.deepEqual(Object.keys(questions), ["weak_distractor"]);
      const contentKey = ((state.content as Record<string, unknown>).contentKey as string);
      calls.push(contentKey);
      return response(contentKey.endsWith("high") ? 0.9 : 0.2, 12);
    },
  };
  const candidates = [candidate("spring.core.topic.high"), candidate("java.core.topic.low")];

  const results = await evaluateReviewCandidates(candidates, client);
  const directory = await mkdtemp(path.join(tmpdir(), "csforge-jev-review-"));
  try {
    const artifacts = await writeReviewArtifacts(directory, candidates, results, { top: 1, skippedCount: 3 });
    const jsonl = await readFile(artifacts.jsonlPath, "utf8");
    const report = await readFile(artifacts.reportPath, "utf8");
    assert.deepEqual(calls, ["java.core.topic.low", "spring.core.topic.high"]);
    assert.ok(jsonl.indexOf("spring.core.topic.high") < jsonl.indexOf("java.core.topic.low"));
    assert.match(report, /### 1\. spring\.core\.topic\.high/);
    assert.doesNotMatch(report, /java\.core\.topic\.low/);
    assert.equal(artifacts.summary.reportViewOmitted, 1);
    assert.equal(artifacts.summary.skippedCount, 3);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("malformed Jev response becomes an API error without a fabricated probability", async () => {
  const client: ReviewPriorityClient = {
    async evaluate() {
      return { response: { model: "jev-1.13.0", answers: {} }, latencyMs: 4 };
    },
  };

  const [result] = await evaluateReviewCandidates([candidate("java.core.topic.q1")], client);

  assert.equal(result.evaluationStatus, "API_ERROR");
  assert.equal(result.errorKind, "INVALID_RESPONSE");
  assert.equal(result.weakDistractorProbability, null);
  assert.equal(result.resolvedModel, null);
});

test("generated artifacts expose only the safe row contract and no provider raw or automatic verdict", async () => {
  const client: ReviewPriorityClient = {
    async evaluate() {
      const evaluated = response(0.75, 7);
      return {
        ...evaluated,
        response: {
          ...evaluated.response,
          providerRaw: { authorization: "Bearer test-secret" },
        } as JevResponse,
      };
    },
  };
  const candidates = [candidate("java.core.topic.q1")];
  const results = await evaluateReviewCandidates(candidates, client);
  const directory = await mkdtemp(path.join(tmpdir(), "csforge-jev-review-"));
  try {
    const artifacts = await writeReviewArtifacts(directory, candidates, results);
    const jsonl = await readFile(artifacts.jsonlPath, "utf8");
    const report = await readFile(artifacts.reportPath, "utf8");
    const row = JSON.parse(jsonl.trim()) as Record<string, unknown>;
    assert.deepEqual(Object.keys(row), [
      "contentKey", "area", "sourcePath", "weakDistractorProbability", "requestedModel", "resolvedModel",
      "rubricVersion", "inputTokens", "latencyMs", "evaluationStatus",
    ]);
    assert.doesNotMatch(jsonl + report, /test-secret|authorization|providerRaw|request body/i);
    assert.doesNotMatch(jsonl + report, /\b(PASS|FAIL|APPROVED|SAFE|REJECT)\b/i);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("missing API key and max candidate overflow stop before evaluation", () => {
  assert.throws(() => requireApiKey(undefined), /TYPESAFE_API_KEY unavailable/);
  assert.throws(() => assertCandidateLimit(51, 50), /no provider calls were made/);
  assert.doesNotThrow(() => assertCandidateLimit(50, 50));
});

function candidate(contentKey: string): ReviewCandidate {
  const question = {
    kind: "question" as const,
    contentKey,
    promptMarkdown: `Question for ${contentKey}`,
    questionType: "MULTIPLE_CHOICE",
    status: "PUBLISHED",
    choices: [
      { key: "A", content: "plausible option", displayOrder: 0 },
      { key: "B", content: "another option", displayOrder: 1 },
    ],
    correctChoiceKey: "A",
  };
  return {
    contentKey,
    area: contentKey.split(".")[0],
    sourcePath: `content/${contentKey.split(".")[0]}/topic/questions.json`,
    question,
    state: { content: question, canonicalLanguage: "ko" },
  };
}

function response(probability: number, inputTokens: number): { response: JevResponse; latencyMs: number } {
  return {
    response: {
      model: "jev-1.13.0",
      answers: { weak_distractor: { type: "noul", noul: probability } },
      usage: { input_tokens: inputTokens, output_tokens: 3 },
    },
    latencyMs: 10,
  };
}
