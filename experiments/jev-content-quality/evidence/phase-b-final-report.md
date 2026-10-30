# Jev Phase B final evidence

Date: 2026-09-22  
Issue: #130  
PR: #131  
Source main: `0f254ccdac91d480cdcde65d22ca9e6bc30b23c0`  
Phase B dataset: `phase-b-natural-current-weak-distractor-2026-09-22`  
Model: `jev-1.13.0`

## Decision

Phase B supports **ADOPT_AS_REVIEW_PRIORITY_SIGNAL** for one narrow use case:

> Rank current CSForge MULTIPLE_CHOICE Questions for human review of weak distractors.

This does **not** authorize automatic PASS/REJECT, canonical acceptance, content mutation, merge approval, or use of Jev for technical correctness, multiple-defensible-answer detection, difficulty, or Concept quality.

The historical-to-current transition is classified as **STRONG_CURRENT_GENERALIZATION within the frozen six-area Phase B slice**. It is not a repository-wide claim for every LearningArea.

## Run integrity

- 120 raw rows
- 120 successful responses
- 0 errors
- 120 UNCALIBRATED
- rubric: `csforge-content-quality-v2`
- criterion: `weak_distractor` only
- requested/resolved model: `jev-1.13.0`
- input tokens: 109,509
- output tokens: 2,760
- latency p50: 272 ms
- latency p95: 353 ms
- estimated input cost: $0.004599378

The original raw result remains locally generated at:

`results/phase-b-natural-current-run-2026-09-22T05-39-34-307Z.jsonl`

The raw result directory is intentionally ignored by Git. A sanitized row-level tracked result is still required before Issue #130 is considered fully complete.

## Frozen Gold

- positive: 28
- negative: 92
- slice prevalence: 28/120 = 23.33%
- all rows: CURRENT MULTIPLE_CHOICE
- historical Phase A/A.1/A.2 contentKey overlap: 0
- no synthetic cases
- no class balancing

The 23.33% prevalence is the frozen six-area sample prevalence, not a repository-wide MC prevalence estimate.

## Ranking quality

- ROC-AUC: **0.9742**
- positive score: min 0.50 / p25 0.65 / median 0.70 / p75 0.7625 / max 0.85 / mean 0.6993
- negative score: min 0.10 / p25 0.22 / median 0.28 / p75 0.4125 / max 0.72 / mean 0.3271
- overlap range: 0.50–0.72
- strongest Human-Gold negative: `database.core.schema.foreign-key.q2` = 0.72
- weakest Human-Gold positive: `network-http.core.request-journey.host-authority.q1` = 0.50

The score overlap is why this experiment does not justify a production PASS/REJECT threshold.

## Fixed review-budget results

| Review budget | Rows | Positive captured | Recall | Precision | Lift vs 23.33% | Human review reduction |
|---|---:|---:|---:|---:|---:|---:|
| Top 10% | 12 | 12/28 | 42.9% | 100.0% | 4.286x | 90% |
| Top 20% | 24 | 20/28 | 71.4% | 83.3% | 3.571x | 80% |
| Top 30% | 36 | 26/28 | 92.9% | 72.2% | 3.095x | 70% |
| Top 40% | 48 | 28/28 | 100.0% | 58.3% | 2.500x | 60% |
| Top 50% | 60 | 28/28 | 100.0% | 46.7% | 2.000x | 50% |

These are predeclared review budgets, not calibrated probability thresholds.

## Area evidence

| Area | Rows | Gold positive | Prevalence | Area AUC |
|---|---:|---:|---:|---:|
| Java | 21 | 10 | 47.6% | 1.0000 |
| Spring | 23 | 4 | 17.4% | 0.9803 |
| Database | 10 | 1 | 10.0% | N/A: positive n=1 |
| Backend Engineering | 22 | 0 | 0.0% | N/A: no positive |
| Operating Systems | 22 | 4 | 18.2% | 1.0000 |
| Network & HTTP | 22 | 9 | 40.9% | 0.9744 |

The signal was not supplied by one area alone, but Database positive support and Backend Engineering positive recall remain under-supported.

## Historical evidence

| Phase | Data | Positive support | AUC | Pair movement |
|---|---|---:|---:|---:|
| A | historical diagnostic | 4 | 1.000 | 4/4 downward |
| A.1 | frozen historical holdout | 8 | 0.979 | 8/8 downward |
| A.2 | independent weak-only historical holdout | 10 | 0.852 | 9/10 downward |
| B | current natural slice | 28/120 | 0.9742 | N/A |

Phase B materially strengthens the case that the weak-distractor signal transfers from historical edits to current content ranking.

## Product boundary

Allowed:
- offline evaluation after deterministic validation
- MC weak-distractor review-priority ordering
- optional diagnostic signal for human content QA

Forbidden:
- automatic PASS/REJECT
- automatic canonical publish/edit/delete
- merge approval
- technical correctness judgment
- multiple-defensible-answer judgment
- difficulty judgment
- Concept-quality judgment

Any future automated action would require a separate calibration dataset, untouched validation set, explicit error-cost policy, and user approval.

## Content-quality finding

The frozen Human Gold identified 28 current Questions needing weak-distractor cleanup in this slice:

- Java: 10
- Spring: 4
- Database: 1
- Backend Engineering: 0
- Operating Systems: 4
- Network & HTTP: 9

Recurring cleanup patterns:
- cross-layer distractors that are immediately removable
- absolute words such as “always”, “automatic”, “all”, or “never” exposing the false choice
- magical guarantees or absurd claims instead of realistic misconceptions
- one plausible distractor plus two unrelated fillers
- definition questions where the correct answer is much more specific than the incorrect choices

Those 28 findings are candidates for a separate canonical-content cleanup review. Jev must not rewrite them automatically.

## Completion evidence

The final experiment evidence is now preserved in tracked repository artifacts:

- `evidence/phase-b-final-report.md`
- `evidence/phase-b-final-metrics.json`
- `evidence/phase-b-sanitized-results.jsonl`

The sanitized row-level result contains exactly 120 rows and only reproducibility-safe fields: caseId, contentKey, area, frozen Human Gold label, weak_distractor probability, dataset/rubric version, and requested/resolved model. It contains no prompt/choice/state payload, headers, credentials, or API secrets.

The raw provider result remains intentionally gitignored. No Jev rerun or threshold calibration is required for Issue #130 completion.
