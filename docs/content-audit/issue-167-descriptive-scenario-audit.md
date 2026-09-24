# Issue #167 — Descriptive / Scenario self-check content audit

**Baseline:** `origin/main` / `23688db31f27489c84ed86277bc86b8b723de482`
**Scope:** 15 canonical LearningAreas; PUBLISHED DESCRIPTIVE and SCENARIO questions only. Content JSON corrections only; no application schema or runtime code changes.

## Full inventory

Counts were recalculated from every canonical `content/{area}/.../questions.json`, excluding non-canonical fixtures. Each target was reviewed for prompt clarity, answer correctness/completeness, explanation usefulness, difficulty, Concept links, and (for SCENARIO) use of the stated situation in reaching a decision.

| LearningArea | DESCRIPTIVE | SCENARIO | PUBLISHED | DRAFT | ARCHIVED |
|---|---:|---:|---:|---:|---:|
| backend-engineering | 36 | 37 | 73 | 0 | 0 |
| cache | 9 | 9 | 18 | 0 | 0 |
| computer-architecture | 49 | 59 | 108 | 0 | 0 |
| database | 19 | 21 | 40 | 0 | 0 |
| distributed-systems | 11 | 9 | 20 | 0 | 0 |
| dsa | 87 | 96 | 183 | 0 | 0 |
| infrastructure-cloud | 9 | 9 | 18 | 0 | 0 |
| java | 32 | 41 | 73 | 0 | 0 |
| messaging-async | 10 | 9 | 19 | 0 | 0 |
| network-http | 127 | 127 | 254 | 0 | 0 |
| operating-systems | 126 | 100 | 226 | 0 | 0 |
| performance-observability-operations | 9 | 9 | 18 | 0 | 0 |
| security | 24 | 23 | 47 | 0 | 0 |
| spring | 20 | 24 | 44 | 0 | 0 |
| system-design | 9 | 9 | 18 | 0 | 0 |
| **Total** | **577** | **582** | **1,159** | **0** | **0** |

Every one of the 582 SCENARIO prompts was inspected. All provide situation facts, constraints, symptoms, inputs, or outcomes that the expected judgment uses; no scenario-only-to-descriptive mismatch requiring a type change was found. Every target has a nonblank contentKey, valid EASY/MEDIUM/HARD difficulty, and at least one Concept link.

### Deterministic quality screens

| Check | Result | Method / interpretation |
|---|---:|---|
| PUBLISHED `modelAnswer` missing or blank | 0 | Trimmed field check |
| PUBLISHED `explanationMarkdown` missing or blank | 0 | Trimmed field check |
| Missing contentKey / Concept link / invalid difficulty | 0 / 0 / 0 | Canonical data checks |
| PUBLISHED self-check shape violations (non-scalar modelAnswer / choices field / acceptedAnswers field / blank prompt) | 0 / 0 / 0 / 0 | Strict property-presence and trimmed-prompt checks |
| Duplicate question contentKeys | 0 | All canonical question packs |
| Exact normalized modelAnswer/explanation copies | 0 | Lowercase alphanumeric/Korean normalization |
| Initial normalized SequenceMatcher similarity candidates ≥ 0.85 | 33 | All explanation-as-answer-copy candidates were corrected; final count is 0 (including exact copies) |
| Short modelAnswer candidates (≤ 80 chars) | 18 | All manually checked; each is a bounded distinction, recommendation, or calculation with sufficient explanation; none remained deficient |
| Long-answer candidates (> 1,000 chars) | 0 | Longest PUBLISHED target answer is 455 characters |
| Multi-part prompt candidates | 549 | Explicit lists/tables/numbering or multiple independent asks; reviewed against answer coverage |
| Trade-off / condition-dependent keyword screen | 332 (147 SCENARIO) | Candidate screen across prompt + answer; every occurrence reviewed in context |
| Under-specified / non-situational SCENARIO remaining | 0 | Full manual review after correction |

The keyword and similarity values above are transparent candidate screens, not semantic quality scores. The full item-level inventory, prompt, classification, answer/explanation lengths, normalized similarity, and scenario review marker are in [issue-167-assessment.csv](issue-167-assessment.csv).

## Corrections

Forty-two existing questions were corrected after review: 14 initial factual/scope/coverage/explanation findings and 28 additional explanation-copy candidates found by the final overlap screen. Each content-only finding was fixed before its final criteria classification. The changed fields for every target are recorded in the CSV by stable contentKey.

| Correction | Question(s) |
|---|---|
| Scope a Java fixed-width overflow prompt to signed 32-bit `int`; state the PostgreSQL-specific READ COMMITTED behavior in its prompt; replace documentation-only IPv4 examples where the situation claimed a public address; remove a documentation-range literal from the NAT scenario | `computer-architecture.core.data-representation.fixed-width-overflow.q3`; `database.core.isolation.read-committed.q2`; `network-http.core.ip-routing.ipv4-address.q3`; `network-http.core.port-nat.connection-tuple.q3` |
| Correct transaction resource-retention overstatement; explain pipeline throughput vs. latency and the three distinct hazard causes/responses; explain why forwarding cannot supply an unavailable load value; correct CNAME latency advice so TTL is cache lifetime, not hop reduction | `backend.core.concurrency-transaction.usecase-transaction.q2`; `computer-architecture.core.pipeline-ilp.pipeline-stages.q2`; `computer-architecture.core.pipeline-ilp.pipeline-hazards.q2`; `computer-architecture.core.pipeline-ilp.forwarding-and-stall.q2`; `network-http.core.dns.cname.q3` |
| Improve explanation value and separate explanation from answer repetition for idempotency, gateway errors, transport/application boundaries, MAC learning, and stateful NAT return mapping | `network-http.core.http-methods.idempotent-method.q2`; `network-http.core.http-status.500-502-503-504.q2`; `network-http.core.layering.link-network-transport-application.q2`; `network-http.core.local-delivery.switch-forwarding.q2`; `network-http.core.port-nat.nat.q2` |

The 28 additional explanation revisions changed the explanation to add the causal or conceptual reason rather than copy an answer clause. They covered one Computer Architecture question, thirteen DSA questions, and fourteen Network/HTTP questions. The content-only correction pass retained each question's stable identity and learning links. No question was added or removed; no contentKey, questionType, status, difficulty, or Concept link changed. No MULTIPLE_CHOICE or SHORT_ANSWER content changed. No unrelated Concept content changed.

The final normalized screen has **0 exact answer/explanation copies and 0 candidates at similarity ≥ 0.85**, down from 33 initial candidates. The initial content-only findings total 42 and the post-fix residual `CONTENT_FIX_ONLY` count is 0.

Technical references used for the specific network claims: [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html), [RFC 9112](https://www.rfc-editor.org/rfc/rfc9112.html), [RFC 6298](https://www.rfc-editor.org/rfc/rfc6298.html), [RFC 7239](https://www.rfc-editor.org/rfc/rfc7239.html), [RFC 9199](https://www.rfc-editor.org/rfc/rfc9199.html), and [IANA IPv4 Special-Purpose Address Registry](https://www.iana.org/assignments/iana-ipv4-special-registry).

## Evaluation-criteria assessment after corrections

Classification was made per PUBLISHED target after the content fixes. A prompt with an explicit list/table/numbered sequence or multiple independent demands was classified `STRUCTURED_CRITERIA_USEFUL`; a single central mechanism, distinction, or bounded calculation was `MODEL_ANSWER_SUFFICIENT`. The CSV provides the same classification per contentKey and prompt so it can be challenged or revised at review.

| LearningArea | DESCRIPTIVE: model | DESCRIPTIVE: structured | SCENARIO: model | SCENARIO: structured | CONTENT_FIX_ONLY final |
|---|---:|---:|---:|---:|---:|
| backend-engineering | 21 | 15 | 29 | 8 | 0 |
| cache | 1 | 8 | 1 | 8 | 0 |
| computer-architecture | 28 | 21 | 20 | 39 | 0 |
| database | 11 | 8 | 15 | 6 | 0 |
| distributed-systems | 1 | 10 | 1 | 8 | 0 |
| dsa | 55 | 32 | 56 | 40 | 0 |
| infrastructure-cloud | 1 | 8 | 1 | 8 | 0 |
| java | 8 | 24 | 15 | 26 | 0 |
| messaging-async | 1 | 9 | 1 | 8 | 0 |
| network-http | 72 | 55 | 82 | 45 | 0 |
| operating-systems | 85 | 41 | 63 | 37 | 0 |
| performance-observability-operations | 0 | 9 | 0 | 9 | 0 |
| security | 14 | 10 | 10 | 13 | 0 |
| spring | 6 | 14 | 12 | 12 | 0 |
| system-design | 0 | 9 | 0 | 9 | 0 |
| **Total** | **610** | **549** | | | **0** |

Of 1,159 final classifications, **610 are `MODEL_ANSWER_SUFFICIENT`, 549 are `STRUCTURED_CRITERIA_USEFUL`, and 0 remain `CONTENT_FIX_ONLY`**. Forty-two content-only findings were corrected (14 from initial content QA plus 28 repeated-explanation candidates from the overlap audit) and then reclassified using the post-fix content. The 549 structured candidates occur in all 15 areas (with a nonzero area count in each), so they represent a repeated cross-area opportunity, not a single-pack exception.

### Representative structured-criteria candidates

These are examples of independent elements whose completion is harder to compare from a prose answer as a whole. The elements below describe possible future self-check points only; none was added to a schema or used for scoring.

| contentKey | Type | Independent elements a learner would compare |
|---|---|---|
| `backend.core.external.circuit-fallback.q3` | DESCRIPTIVE | breaker states and transition thresholds; HALF_OPEN probe policy; why breaker state does not isolate concurrency; separate bulkhead capacity |
| `computer-architecture.core.pipeline-ilp.pipeline-hazards.q2` | DESCRIPTIVE | structural/data/control causes; one fitting response for each hazard |
| `computer-architecture.core.performance.latency-throughput.q3` | SCENARIO | batch overhead vs. queue/fill latency; throughput vs. p99; SLA and queue metrics for choosing size |
| `dsa.core.algorithm-selection.data-shape.q4` | SCENARIO | average-case distribution assumption; collision/probe failure mode; skew/adversarial fixtures; structure alternatives |
| `dsa.core.hashing.average-worst-lookup.q3` | SCENARIO | bucket/probe distribution; worst chain/cluster; load/resize/tombstone state; triggering key pattern |
| `infrastructure.core.network.load-balancing-ingress.q3` | DESCRIPTIVE | readiness before routing; draining existing connections; TLS termination boundary; health-check dependency scope |
| `java.core.time-numeric.bigdecimal-money-rounding.q7` | DESCRIPTIVE | per-line vs. final rounding; currency/minor unit and scale; rounding mode; domain-defined rounding stage |
| `messaging.core.workflow.transactional-outbox.q3` | DESCRIPTIVE | aggregate sequence; relay claim/publish order; consumer gap/reordering check; stable event ID deduplication |
| `network-http.core.port-nat.connection-tuple.q3` | SCENARIO | source/destination tuple; translated port uniqueness; NAT mapping lookup; reverse translation to the correct client |
| `backend.core.bulk-batch.bulk-processing.q2` | DESCRIPTIVE | per-transaction atomicity; memory/lock duration; partial progress and restart/recovery cost; chunk-level throughput and operational trade-off |

### Cases where separate criteria add little

- `operating-systems.core.virtual-memory.page-frame.q3` (SCENARIO): given page and mapping sizes, one ceiling division and internal-fragmentation result.
- `network-http.core.request-journey.origin.q2` (DESCRIPTIVE): a bounded origin comparison; the decisive scheme difference is explicit.
- `security.core.authn-authz.authentication.q1` (DESCRIPTIVE): one boundary distinction—authentication establishes the subject; authorization checks access to the requested order.

### Schema decision

**Do not add `evaluationPoints[]` in this issue.** The static inventory shows a broad potential use for independent checklists (549 candidates across all 15 areas), but “useful” is not evidence that a new persistence/import/API contract is necessary to complete the current self-check flow. Published model answers already state the expected independent elements, explanations are present, and the current Result/Wrong Note path displays the prompt, submitted response, model answer, explanation, and related Concepts without automatic grading. The repository has no learner-response or partial-self-check outcome evidence showing that clearer answer/explanation content cannot serve this contract. A future product-value decision should validate whether learners need criterion-by-criterion state before designing a global schema; this audit does not introduce a rubric or partial score.

Published explanation completeness is already 1,159/1,159, so there is no data backfill to perform. Since current publication rules make explanation optional and the audit produced no compatibility need for a new invariant, no Import/Domain invariant or DB migration is recommended.

## Identity and history

- Compared with `origin/main`, all 2,525 canonical Question contentKeys remain present; 0 added, 0 removed, 0 type/status changes. For the 1,159 target set, area/type/status identity is unchanged.
- Import integration validation uses the disposable Testcontainers database. It imports the canonical pack, previews all batches with zero errors, applies successfully, repeats the exact content as `UNCHANGED`, and compares all Question IDs. It seeds Attempt, WrongNote, ReviewSchedule, and ReviewHistory on a corrected Question, applies a temporary same-key content revision, restores the canonical pack, and verifies those history IDs, the Question ID, Concept-link count, and canonical explanation remain intact. No production DB was accessed.

## Result / Wrong Note self-check regression review

Existing `QuizResultPage` and `WrongNoteDetailPage` render the user's response, model answer, optional explanation, and related Concept navigation for non-MC/non-short-answer types. The corresponding component tests exercise existing model-answer/explanation presentation. This change touches canonical content only; no Result/Wrong Note regression or field contract was altered.

## Validation

- **Full canonical deterministic audit: PASS.** 1,159 published self-check questions; required fields, valid difficulty, Concept link, scalar answer, no choices/acceptedAnswers, duplicate keys, and stable identity/type/status checks all passed.
- **Preview → Apply → exact reimport: PASS.** Full canonical Testcontainers import applied; all-batch exact preview reported zero errors and UNCHANGED; exact bootstrap repeat was unchanged. A corrected question with existing history also passed same-key update and canonical restoration.
- **Backend tests: PASS.** ./gradlew.bat test --no-daemon --stacktrace
- **Backend build: PASS.** ./gradlew.bat build --no-daemon --stacktrace
- **Frontend: PASS.** npm ci; npm run lint; npm test (28 files / 84 tests); npm run build.
- **Compose validation: PASS.** docker compose config --quiet; production config with POSTGRES_PASSWORD=validation-secret; expected production-config failure with the secret removed.
- **Repository validation: PASS.** All validation steps from .github/workflows/repository-validation.yml were run; the deployment job was not run.
- **git diff --check: PASS.**
