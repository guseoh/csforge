import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRubric } from "../src/rubric.js";

test("weak_distractor is requested only for multiple-choice questions", () => {
  assert.equal(buildRubric("QUESTION", "en", "DESCRIPTIVE").questions.weak_distractor, undefined);
  assert.ok(buildRubric("QUESTION", "en", "MULTIPLE_CHOICE").questions.weak_distractor);
});

test("multiple_defensible_answers is about incompatible conclusions, not wording variants", () => {
  const instruction = String(buildRubric("QUESTION", "en", "DESCRIPTIVE").questions.multiple_defensible_answers.instructions);
  assert.match(instruction, /decisive condition/i);
  assert.match(instruction, /not about different wording/i);
});
