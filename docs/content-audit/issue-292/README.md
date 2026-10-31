# Java G3 — canonical diagram and renderer audit (Issue #292)

> Source and renderer inventory, **not** browser visual QA acceptance. Baseline: `d71872e770e61c2a6fa7f7eb9cf6569ee1902007`. The original #277 tiers are not G3 quality verdicts.

## Full inventory

| Metric | Count |
| --- | ---: |
| Java Concepts | **145** |
| With a `csforge-viz` declaration | **85** |
| Without a declaration | **60** |
| `java-api-contract` with explicit G3 Java example dispatch | **68/68** |
| Other specialized declaration types with existing route | **17/17** |
| Remaining generic `java-api-contract` route | **0** |
| Browser-verified visual approvals | **0 reported** |
| Legacy Java SVG + current viz duplicate candidates | **2** |

The machine-readable `java-g3-review.json` records **every one of the 145 Java Concepts** with its canonical source path and whether the diagram routes through a G3-specific Java component or an existing specialized visualization type. The 85 diagrams were checked against canonical declarations and current React route cases. This is a **source-level audit**. A compiled component, a passing SSR test, and a browser-verified responsive diagram are separate outcomes.

## Legacy specialized types — keep provisionally, visually inspect before approval

- **7 Java object model diagrams:** static members, initialization, inheritance, composition, dispatch, casting, defensive copy. Need real visual checks for arrow clarity, fit, and type vs runtime guarantees; no forced G3 rewrite solely to increase the specialized count.
- **3 value/reference diagrams:** assignment-copy, final-list, string-intern. Keep subject semantics, inspect contrast/overlap and keyboard support.
- **3 `static-flow` diagrams:** StringBuilder mutation, byte-versus-character streams, and buffered I/O. Older generic vertical renderers, visually inspect for oversized rectangles and text.
- **1 Java array-store / 1 definite-assignment:** compile-time vs runtime and branch initialization; preserve correct language contracts.
- **1 pass-by-value:** already uses a G3 editorial explanation, still requires actual Reader QA.
- **1 min-heap:** interactive heap is intentional; keep interaction and validate state invariants and accessibility.

## Two legacy SVG coexistence candidates

- `content/java/design-patterns/strategy-pattern.md`: `/learning/java/strategy-pattern.svg` plus `csforge-viz`.
- `content/java/streams/stream-pipeline-laziness.md`: `/learning/java/stream-pipeline.svg` plus `csforge-viz`.

Do not remove either asset before comparing the actual images and checking asset references/test fixtures. Removing a canonical image would invoke the full Import Validation and personal/history preservation contract.

## Quality gates still open

1. Exact HEAD PR/Push CI validation (frontend typecheck/tests/build plus backend regression).
2. **85/85 actual Reader** screenshot verdicts: Guest and Owner, light/dark, 320 / 390 / 768 / 1024 / 1440px, content overflow and code labels.
3. Keyboard step navigation, focus, reduced-motion and min-heap state invariants.
4. Reassess **60 no-diagram Concepts** for true visual necessity — these are not forced diagrams.
5. Any canonical source edit must have isolated Import Preview/Apply, zero ERROR, repeat Import UNCHANGED and personal/history preservation.

This batch changes no canonical Markdown, Question, contentKey, Import state, or Production DB. Keep PR #293 Draft and unmerged. Issue #294 typography/inline-code is separate.
