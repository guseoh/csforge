import { test } from "node:test";
import assert from "node:assert/strict";
import { derivePolicy, QUESTION_NOUL_IDS } from "../src/policy.js";

const answers = Object.fromEntries(QUESTION_NOUL_IDS.map((id) => [id, { type: "noul" as const, noul: 0.1 }]));
const thresholds = Object.fromEntries(QUESTION_NOUL_IDS.map((id) => [id, 0.8]));

test("policy plumbing derives PASS when every calibrated atomic probability is below threshold", () => {
  assert.equal(derivePolicy(answers, thresholds, QUESTION_NOUL_IDS).decision, "PASS");
});

test("policy plumbing derives REVIEW from one triggered atomic criterion", () => {
  const reviewAnswers = { ...answers, material_technical_error: { type: "noul" as const, noul: 0.95 } };
  const result = derivePolicy(reviewAnswers, thresholds, QUESTION_NOUL_IDS);
  assert.equal(result.decision, "REVIEW");
  assert.deepEqual(result.triggeredCriteria, ["material_technical_error"]);
});

test("policy remains uncalibrated when thresholds are absent", () => {
  assert.equal(derivePolicy(answers, undefined, QUESTION_NOUL_IDS).decision, "UNCALIBRATED");
});
