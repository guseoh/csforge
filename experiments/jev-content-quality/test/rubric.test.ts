import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRubric, RUBRIC_VERSION } from "../src/rubric.js";

const excluded = [
  "response_shape_mismatch",
  "difficulty_fit",
  "answer_explanation_conflict",
  "linked_concept_misalignment",
  "layer_boundary_confusion",
  "learning_objective_gap",
  "causal_or_state_flow_gap",
];

test("weak_distractor is requested only for multiple-choice questions", () => {
  assert.equal(buildRubric("QUESTION", "en", "DESCRIPTIVE").questions.weak_distractor, undefined);
  assert.ok(buildRubric("QUESTION", "en", "MULTIPLE_CHOICE").questions.weak_distractor);
});

test("V2 Question rubric contains only applicable included criteria", () => {
  assert.equal(RUBRIC_VERSION, "csforge-content-quality-v2");
  assert.deepEqual(Object.keys(buildRubric("QUESTION", "ko", "MULTIPLE_CHOICE").questions), [
    "material_technical_error",
    "multiple_defensible_answers",
    "weak_distractor",
  ]);
  assert.deepEqual(Object.keys(buildRubric("QUESTION", "ko", "SCENARIO").questions), [
    "material_technical_error",
    "multiple_defensible_answers",
  ]);
});

test("V2 Concept rubric contains material_technical_error only", () => {
  assert.deepEqual(Object.keys(buildRubric("CONCEPT", "en").questions), ["material_technical_error"]);
});

test("excluded criteria and difficulty_fit are absent from every V2 request", () => {
  for (const kind of ["QUESTION", "CONCEPT"] as const) {
    const ids = Object.keys(buildRubric(kind, "en", "MULTIPLE_CHOICE").questions);
    assert.deepEqual(ids.filter((id) => excluded.includes(id)), []);
  }
});

test("multiple_defensible_answers is about incompatible conclusions, not wording variants", () => {
  const instruction = String(buildRubric("QUESTION", "en", "DESCRIPTIVE").questions.multiple_defensible_answers.instructions);
  assert.match(instruction, /decisive condition/i);
  assert.match(instruction, /Different wording/i);
});
