# #155 rationale quality benchmark: INCONCLUSIVE

The frozen `rationale-quality-v2` rubric was evaluated against the 46-case holdout in [GitHub run 35960534195](https://github.com/guseoh/csforge/actions/runs/35960534195). All 46 calls succeeded; no case matched the deterministic explanation-copy exclusion. The data and rubric hashes match `data/rationale-freeze.json`. Detailed probabilities and metrics are in `rationale-holdout-results.jsonl`, `rationale-holdout-metrics.json`, and `rationale-holdout-report.md`. The development v1 and v2 results are also preserved; no holdout score was used to edit the rubric.

## Holdout ranking usefulness

Each cell gives **recall / precision / lift over random** for the specified review budget. Natural, historical and synthetic cases are separate evidence populations. Budget count is rounded up.

| Source | Cases / positives | 10% | 20% | 30% | ROC-AUC |
| --- | ---: | --- | --- | --- | ---: |
| Natural canonical | 30 / 1 | 1.000 / 0.333 / 10.000 | 1.000 / 0.167 / 5.000 | 1.000 / 0.111 / 3.333 | 1.000 |
| Historical review fixes | 4 / 2 | 0.500 / 1.000 / 2.000 | 0.500 / 1.000 / 2.000 | 0.500 / 0.500 / 1.000 | 0.750 |
| Controlled synthetic | 12 / 6 | 0.333 / 1.000 / 2.000 | 0.500 / 1.000 / 2.000 | 0.667 / 1.000 / 2.000 | 1.000 |

The natural AUC/recall is based on **one** positive (`natural-java-0`, an Adapter rationale with a bare responsibility statement). The other 29 natural cases are Gold negatives. This cannot establish recall for natural misalignment or conflict. The two historical holdout positives are real review corrections, but that is also too few for a stable rate. Synthetic AUC shows the model orders controlled edits above their originals; it is not a prevalence-weighted estimate for production content.

## Criterion errors and Korean technical failures

At the diagnostic probability cutoff 0.5, the natural holdout has no FP/FN. Historical holdout has one misalignment FN and one conflict FN, with no FP. Synthetic holdout has two misalignment FN, no conflict FN, no shallow FN, and one shallow FP. This cutoff is not an automatic decision policy.

- `history-3-before`: a Korean comparator explanation says **distance/name** for a **score/name** choice. Misalignment probability is 0.07, equal to its corrected counterpart. Its overall priority score 0.33 comes from shallow, so the intended criterion did not identify the mismatch.
- `history-4-before`: the explanation reaches the right answer `-1` but gives a false two's-complement derivation from zero. Conflict probability is 0.17 and overall score 0.22; the corrected version scores 0.14. The positive falls outside the historical top 30% because the other corrected case scores 0.27.
- `synthetic-3-edited` and `synthetic-6-edited`: rationale swaps to another distractor yield misalignment probabilities 0.46 and 0.32. Both rank below the stronger conflict/shallow edits and fall outside the synthetic top 30%. The development swap also scored 0.36. This is a repeated weakness on choice-specific rationale swaps.
- `synthetic-4-edited`: a false saga transaction claim correctly receives conflict 0.95 but also shallow 0.68, although it provides a concrete causal claim. This is a criterion-level false alarm despite a correct overall review ranking.

## Development iteration and cost

The first development rubric gave 13/15 natural negatives misalignment probability ≥0.5 and historical AUC 0.222. The only rubric revision before holdout made the target choice text explicit and excluded valid comparisons that rebut a misconception. The second development run then had 0/15 natural diagnostic false positives, historical AUC 0.889, and synthetic AUC 1.000. The dataset, Gold labels, review budget formula and max-probability score did not change. The first holdout workflow attempt failed at validation because Windows and Linux normalized JSONL line endings differently; hash normalization was fixed before any holdout provider call.

| Run | Input / output tokens | Input-cost estimate | Latency p50 / p95 |
| --- | ---: | ---: | ---: |
| Development v1 | 23,245 / 1,890 | $0.000976 | 327 / 510 ms |
| Development v2 | 25,761 / 1,890 | $0.001082 | 287 / 824 ms |
| Frozen holdout | 44,666 / 3,220 | $0.001876 | 252 / 631 ms |

The three successful runs used 93,672 input and 7,000 output tokens. Total estimated **input** cost is $0.003934 using the existing harness assumption of $0.042 per million input tokens. Actual billing and output-token cost are unavailable, so this is not a total-cost claim.

## Recommendation

**INCONCLUSIVE.** The candidate offers useful ranking evidence for one natural shallow case and clear synthetic conflict/shallow edits. It misses or weakly scores choice-specific misalignment and a real technical-derivation conflict. Natural Gold has no misalignment/conflict positives and only one shallow positive. More independent real positive examples are needed before considering an operational review-priority signal. Keep `choice_rationale_*` out of automatic PASS/FAIL, canonical edits, merge gates, and the existing weak-distractor workflow. Product adoption remains a separate decision.
