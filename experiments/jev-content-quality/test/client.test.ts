import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRubric } from "../src/rubric.js";
import { TypeSafeApiError, validateJevResponse } from "../src/client.js";

const descriptiveQuestions = buildRubric("QUESTION", "en", "DESCRIPTIVE").questions;
const choiceQuestions = buildRubric("QUESTION", "en", "MULTIPLE_CHOICE").questions;

function validResponse(questions: typeof descriptiveQuestions): Record<string, unknown> {
  const answers: Record<string, unknown> = {};
  for (const [id, question] of Object.entries(questions)) {
    if (question.type === "noul") {
      answers[id] = { type: "noul", noul: 0.1 };
    } else {
      const keys = Object.keys(question.criteria as Record<string, string>);
      answers[id] = {
        type: "choice",
        choice: keys[0],
        probabilities: Object.fromEntries(keys.map((key) => [key, 1 / keys.length])),
        confidence: 0.9,
      };
    }
  }
  return { model: "jev-1.13.0", answers, usage: { input_tokens: 10, output_tokens: 20 } };
}

function assertInvalid(value: unknown, questions: typeof descriptiveQuestions): void {
  assert.throws(
    () => validateJevResponse(value, questions),
    (error: unknown) => error instanceof TypeSafeApiError && error.kind === "INVALID_RESPONSE",
  );
}

test("validates a complete Noul and Choice response", () => {
  const response = validateJevResponse(validResponse(choiceQuestions), choiceQuestions);
  assert.equal(response.model, "jev-1.13.0");
});

test("rejects a missing requested answer", () => {
  const response = validResponse(descriptiveQuestions) as { answers: Record<string, unknown> };
  delete response.answers.material_technical_error;
  assertInvalid(response, descriptiveQuestions);
});

test("rejects an answer type mismatch", () => {
  const response = validResponse(descriptiveQuestions) as { answers: Record<string, unknown> };
  response.answers.material_technical_error = { type: "choice", choice: "true", probabilities: { true: 1 }, confidence: 1 };
  assertInvalid(response, descriptiveQuestions);
});

test("rejects an out-of-range Noul probability", () => {
  const response = validResponse(descriptiveQuestions) as { answers: Record<string, Record<string, unknown>> };
  response.answers.material_technical_error = { type: "noul", noul: 1.1 };
  assertInvalid(response, descriptiveQuestions);
});

test("rejects an unknown Choice option", () => {
  const response = validResponse(choiceQuestions) as { answers: Record<string, { choice?: string }> };
  response.answers.difficulty_fit = { choice: "UNKNOWN" };
  assertInvalid(response, choiceQuestions);
});

test("rejects a Choice probability distribution that does not sum to one", () => {
  const response = validResponse(choiceQuestions) as { answers: Record<string, { probabilities?: Record<string, number> }> };
  response.answers.difficulty_fit = { probabilities: { TOO_EASY: 0.5, APPROPRIATE: 0.2, TOO_HARD: 0.2 } };
  assertInvalid(response, choiceQuestions);
});
