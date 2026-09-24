import assert from "node:assert/strict";
import test from "node:test";
import { auc, isExplanationCopy, loadCases, metrics, stateFor, type Case, type Result } from "../src/rationale-quality.js";

test("frozen dataset has distinct cases and no source group crosses the holdout boundary", () => {
  const cases = loadCases();
  assert.equal(cases.length, 73);
  assert.equal(cases.filter((row) => row.sourceKind === "natural").length, 45);
  assert.equal(cases.filter((row) => row.sourceKind === "historical").length, 10);
  assert.equal(cases.filter((row) => row.sourceKind === "synthetic").length, 18);
  const history = cases.filter((row) => row.sourceKind === "historical");
  assert.equal(history.filter((row) => Object.values(row.gold).some(Boolean)).length, 5);
  assert.equal(cases.filter((row) => row.sourceKind === "natural" && row.gold.choice_rationale_shallow).length, 1);
  const sample = cases.find((row) => row.caseId === "history-3-before")!;
  assert.equal((stateFor(sample).targetChoiceKey), "B");
  assert.match(sample.rationaleMarkdown, /distance/);
});

test("copy check catches explanation duplication without excluding a short causal rationale", () => {
  const explanation = "같은 cache key를 두 type이 공유하면 서로 덮어쓰므로 namespace를 분리해야 한다.";
  assert.equal(isExplanationCopy(explanation, explanation), true);
  assert.equal(isExplanationCopy("정답이다.", "정답이다."), true);
  assert.equal(isExplanationCopy("TTL은 key 만료 시점을 정할 뿐 이름 충돌은 분리하지 않는다.", explanation), false);
});

test("budget ranking, pairwise AUC, and criterion errors use explicit gold", () => {
  const source = loadCases().find((row) => row.sourceKind === "natural")!;
  const makeCase = (id: string, positive: boolean): Case => ({ ...source, caseId: id, groupId: id,
    gold: { choice_rationale_misalignment: positive, choice_rationale_conflict: false, choice_rationale_shallow: false } });
  const cases = [makeCase("a", true), makeCase("b", false), makeCase("c", true), makeCase("d", false)];
  const scores = [0.9, 0.8, 0.7, 0.1];
  const results: Result[] = cases.map((candidate, index) => ({ caseId: candidate.caseId,
    sourceKind: "natural", split: "development", status: "evaluated", score: scores[index],
    probabilities: { choice_rationale_misalignment: scores[index], choice_rationale_conflict: 0, choice_rationale_shallow: 0 } }));
  const summary = metrics(cases, results);
  assert.equal(summary.ranking.natural.budgets["10"].recall, 0.5);
  assert.equal(summary.ranking.natural.budgets["20"].precision, 1);
  assert.equal(summary.ranking.natural.budgets["30"].precision, 0.5);
  assert.equal(summary.ranking.natural.rocAuc, 0.75);
  assert.equal(summary.criterion.natural.choice_rationale_misalignment.falsePositive, 1);
  assert.equal(summary.criterion.natural.choice_rationale_misalignment.falseNegative, 0);
  assert.equal(auc([{ score: 0.5, positive: true }, { score: 0.5, positive: false }]), 0.5);
});
