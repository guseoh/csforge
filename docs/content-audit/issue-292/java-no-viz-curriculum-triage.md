# Java G3 — non-illustrated Concept triage (Issue #292)

Source baseline: `main=5f7f55935f6f3debc259cfc82327aac9a70bdec5`, reviewed 2026-10-31.

**Scope:** All **60/60 Java Concepts without csforge-viz** were checked by canonical title, stated learning objective and available Java code-example count. A sample of six high-risk articles was also read in more detail, as documented in the Issue #292 post-merge review. This is a **curriculum-level visual-necessity triage, not full 60-document factual/prose audit**.

- **52**: current text and Java code examples are sufficient to begin learning without forcing new diagrams; no REQUIRED image established.
- **8**: optional future illustrations only if learners struggle, or if a deeper pack review finds a structural gap. Existing relevant Java G3 renderers can already cover adjacent concepts, so blind duplication is not justified.
- **0 required omissions identified** at this level of review; absence of a diagram does not by itself imply missing curriculum coverage.
- User decision: **desktop-first only**. No newly authored canonical Markdown, content keys, Questions, DB import, or production data changes.
- Code-level/factual validation remains a separate content-review contract. This list does not certify that each explanatory paragraph or code listing is correct.

| # | Concept | Visual status | Reason / optional trigger |
|---:|---|---|---|
| 01 | `language-types.numeric-conversion-overflow` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 02 | `language-types.boxing-unboxing-wrapper` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 03 | `language-types.string-immutability-equality` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 04 | `object-model.class-object-constructor` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 05 | `object-model.encapsulation-invariants` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 06 | `object-model.abstraction-responsibility` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 07 | `object-model.overload-vs-override` | OPTIONAL | Optional compiler-time overload vs runtime override comparison; existing dynamic-dispatch G3 already covers latter |
| 08 | `object-model.interface-vs-abstract-class` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 09 | `api-design.static-factory-method` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 10 | `api-design.builder-pattern-construction` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 11 | `api-design.minimize-accessibility-api-surface` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 12 | `api-design.method-contract-parameter-validation` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 13 | `object-contracts.equals-contract` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 14 | `object-contracts.tostring-diagnostics` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 15 | `object-contracts.comparable-natural-order` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 16 | `enum-modeling.enum-closed-values-behavior` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 17 | `enum-modeling.enum-ordinal-name-persistence` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 18 | `enum-modeling.enumset` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 19 | `enum-modeling.enummap` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 20 | `design-patterns.template-method-pattern` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 21 | `design-patterns.factory-pattern` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 22 | `collections.hashset-set-semantics` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 23 | `collections.sorted-collections-tree` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 24 | `generics.generic-types-methods` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 25 | `generics.raw-types-unchecked` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 26 | `generics.type-erasure-reifiable-types` | OPTIONAL | Optional source-signature vs runtime-object comparison; existing heap-pollution G3 covers one high-risk consequence |
| 27 | `exceptions-resources.standard-exceptions-contract` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 28 | `exceptions-resources.exception-as-control-flow` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 29 | `functional.functional-interface` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 30 | `functional.behavior-parameterization` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 31 | `functional.lambda-target-typing` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 32 | `functional.method-reference-functional-composition` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 33 | `streams.stream-reduce` | OPTIONAL | Optional associative reduction tree, if future learner feedback demonstrates confusion |
| 34 | `streams.collectors-grouping-partitioning` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 35 | `streams.tomap-duplicate-keys` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 36 | `streams.stream-side-effects-noninterference` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 37 | `modern-language.optional-return-boundary` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 38 | `modern-language.record-data-modeling` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 39 | `modern-language.sealed-types-closed-hierarchy` | OPTIONAL | Optional permitted direct-subtype tree; code example already demonstrates closure |
| 40 | `modern-language.local-variable-type-inference-var` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 41 | `modern-language.switch-expressions` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 42 | `modern-language.pattern-matching` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 43 | `modern-language.text-blocks` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 44 | `modern-language.default-static-interface-methods` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 45 | `time-numeric.clock-testable-time` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 46 | `time-numeric.datetimeformatter-parsing-formatting` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 47 | `time-numeric.floating-point-precision` | OPTIONAL | Optional binary rational approximation illustration, only with technically exact numeric model |
| 48 | `time-numeric.bigdecimal-money-rounding` | OPTIONAL | Optional scale/rounding chart if real exercises reveal need; text/code currently define policies |
| 49 | `io-nio.input-output-reader-writer` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 50 | `io-nio.path-files-api` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 51 | `coding-tests.fast-input-bufferedreader-tokenizer` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 52 | `coding-tests.buffered-output-stringbuilder` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 53 | `coding-tests.sorting-arrays-collections` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 54 | `coding-tests.comparator-for-coding-tests` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 55 | `coding-tests.priorityqueue-coding-tests` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 56 | `coding-tests.hashmap-hashset-counting` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 57 | `concurrency.concurrent-collections` | OPTIONAL | Optional atomic single operation vs non-atomic multiple operations sequence; existing race/cas G3 cover coordination |
| 58 | `jvm-runtime.runtime-diagnostics-jcmd-jstack-jfr` | OPTIONAL | Optional symptom-to-tool decision guide, not memory/runtime state diagram |
| 59 | `metadata-compatibility.reflection-class-api` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |
| 60 | `metadata-compatibility.annotations-retention-target` | TEXT/CODE | No missing diagram requirement established from objective and available code examples |

## Legacy SVG coexistence decisions

1. **Strategy** — **KEEP both for now**: the old static SVG shows two alternative concrete policy implementations, while G3 shows caller→interface→one selected implementation. They share the general pattern but teach different information; removing the legacy image would discard a comparison without an equivalent replacement. A deliberate source edit and Import Preview/Apply/unchanged-history contract would be required before later removal.
2. **Stream pipeline** — **KEEP both**: original SVG shows generic source/filter/map/terminal pipeline, G3 focuses on lazy `anyMatch` short-circuit execution. Complementary learning goals.

## Closing gates

- PR #295 full CI and 85-diagram desktop Chromium QA, including all intermediate step control families and heap operation invariants.
- Real Vercel Production Guest and authenticated Google Owner Reader usability/PWA update behavior, which isolated mocked Owner QA does not verify.
- After PR approval/merge, refresh Issue #292 classification and close only if actual post-merge evidence satisfies agreed acceptance scope.
