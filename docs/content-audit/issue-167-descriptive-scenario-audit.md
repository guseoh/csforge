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
| Multi-part prompt candidates | 549 | Candidate screen only (explicit lists/tables/numbering or multiple asks); candidate status did not determine final classification |
| Trade-off / condition-dependent keyword screen | 332 (147 SCENARIO) | Candidate screen across prompt + answer; every occurrence reviewed in context |
| Under-specified / non-situational SCENARIO remaining | 0 | Full manual review after correction |

The keyword and similarity values above are transparent candidate screens, not semantic quality scores. In particular, the multi-part screen is not a classification rule. The full item-level inventory, prompt, individualized classification basis, answer/explanation lengths, normalized similarity, and scenario review marker are in [issue-167-assessment.csv](issue-167-assessment.csv).

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

## Evaluation-criteria classification re-review

All 1,159 rows were reviewed again against Issue #167’s answer-content test. Prompt formatting (lists, tables, numbering, or multiple nouns) is only a candidate-screen signal. `STRUCTURED_CRITERIA_USEFUL` is reserved for answers with multiple independently checkable elements where partial completion is plausible and criterion-by-criterion comparison materially helps; a single central judgment/mechanism remains `MODEL_ANSWER_SUFFICIENT`, even when the scenario supplies several context facts or a timeline. `CONTENT_FIX_ONLY` is the pre-correction finding state and its final residual remains zero.

| Classification | Prior | Re-reviewed | Change |
|---|---:|---:|---:|
| `MODEL_ANSWER_SUFFICIENT` | 610 | 802 | +192 |
| `STRUCTURED_CRITERIA_USEFUL` | 549 | 357 | -192 |
| `CONTENT_FIX_ONLY` remaining | 0 | 0 | 0 |

Against the prior matrix, 211 former structured rows were reclassified as model-answer-sufficient and 19 former model-answer rows were promoted after reverse review. The net structured count is lower by 192. The 549 multi-part/list/table prompt count remains a screening statistic, not the final criteria classification. Every retained structured row now has an individualized `assessmentBasis` naming that answer’s independent check dimensions; each model-sufficient row records the central answer span supporting direct comparison.

| LearningArea | DESCRIPTIVE model | DESCRIPTIVE structured | SCENARIO model | SCENARIO structured | CONTENT_FIX_ONLY |
|---|---:|---:|---:|---:|---:|
| backend-engineering | 26 | 10 | 34 | 3 | 0 |
| cache | 6 | 3 | 6 | 3 | 0 |
| computer-architecture | 30 | 19 | 32 | 27 | 0 |
| database | 16 | 3 | 19 | 2 | 0 |
| distributed-systems | 1 | 10 | 3 | 6 | 0 |
| dsa | 74 | 13 | 82 | 14 | 0 |
| infrastructure-cloud | 0 | 9 | 4 | 5 | 0 |
| java | 15 | 17 | 23 | 18 | 0 |
| messaging-async | 2 | 8 | 5 | 4 | 0 |
| network-http | 87 | 40 | 106 | 21 | 0 |
| operating-systems | 97 | 29 | 74 | 26 | 0 |
| performance-observability-operations | 1 | 8 | 0 | 9 | 0 |
| security | 16 | 8 | 11 | 12 | 0 |
| spring | 13 | 7 | 19 | 5 | 0 |
| system-design | 0 | 9 | 0 | 9 | 0 |
| **Total** | **384** | **193** | **418** | **164** | **0** |

### Representative `STRUCTURED_CRITERIA_USEFUL` rows

Each basis below is copied from its row-specific assessment entry. The criteria are evidence for self-check utility only; this PR adds no scoring or schema.

| contentKey | Type | Independent elements in this answer |
|---|---|---|
| `backend.core.api.methods-status.q2` | DESCRIPTIVE | 생성 완료와 생성 결과 위치 \| 아직 완료되지 않은 접수 \| 현재 resource state와 충돌하는 요청 \|
| `backend.core.external.circuit-fallback.q3` | DESCRIPTIVE | failure window threshold와 HALF_OPEN probe 전이 \| breaker와 분리된 bulkhead 동시 자원 한도 \|
| `computer-architecture.core.pipeline-ilp.pipeline-hazards.q2` | DESCRIPTIVE | structural resource 원인과 대응 \| data operand readiness 원인과 대응 \| control next-PC 불확정 원인과 recovery \|
| `computer-architecture.core.performance.latency-throughput.q3` | SCENARIO | batching으로 줄어드는 fixed overhead/aggregate 처리량 \| fill·queue 대기로 늘어나는 p99 \| SLA·arrival rate·queue depth 기준 선택 \|
| `database.core.mvcc.visibility.q1` | DESCRIPTIVE | READ COMMITTED statement별 새 snapshot \| REPEATABLE READ transaction snapshot 유지 \| 중간 commit의 후속 SELECT 가시성 차이 \|
| `dsa.core.algorithm-selection.data-shape.q4` | SCENARIO | 균등 key/hash 분포 가정 \| collision·probe clustering 위험 \| skew/adversarial fixture 및 load-factor/대안 구조 검증 \|
| `network-http.core.port-nat.connection-tuple.q3` | SCENARIO | source/destination address and port plus protocol tuple \| translated public source-port uniqueness/mapping \| reverse tuple lookup to internal client \|
| `operating-systems.core.scheduling.context-switch.q3` | SCENARIO | context-switch increase as a symptom \| scheduling/cache/TLB overhead as candidate cause \| runnable queue and miss/throughput/latency measures to confirm \|
| `performance.core.measurement.latency-throughput.q3` | DESCRIPTIVE | successful throughput versus attempts/retries \| latency/error/capacity trade-off \| user SLO and same-workload success criterion \|
| `security.core.abuse.ssrf.q2` | SCENARIO | initial host allowlist check \| redirect destination and DNS resolution revalidation \| bounded redirect/response policy \|
| `spring.core.mvc.message-converter.q2` | DESCRIPTIVE | deserialization/type-conversion failure boundary \| post-conversion Bean Validation failure boundary \| controller invocation timing \|
| `system-design.core.architecture.sync-async.q3` | DESCRIPTIVE | synchronous payment outcome boundary \| asynchronous indexing and freshness contract \| timeout/idempotency/replay recovery \|
| `system-design.core.reliability.failure-isolation.q3` | DESCRIPTIVE | per-operation timeout/rate/backpressure/shedding roles \| queue, pool and end-to-end deadline budgets \| cancellation/retry amplification guard \|
| `system-design.core.requirements.ownership-boundaries.q3` | DESCRIPTIVE | aggregate/invariant owner \| API/write and migration rights \| recovery/projection rebuild and cross-boundary workflow consistency \|

### Representative `MODEL_ANSWER_SUFFICIENT` rows

These prompts had been at risk of being treated as structured because of scenario timelines, multiple facts, or comparison wording. Their expected response converges on one central distinction/mechanism that the answer and explanation already expose.

| contentKey | Type | Central answer check |
|---|---|---|
| `backend.core.concurrency-transaction.optimistic.q3` | SCENARIO | 하나의 중심 판단으로 수렴해 모델답변·설명으로 직접 대조 가능: “stale write conflict를 명시하고 최신 representation을 다시 보여주거나 use-case상 안전한 경우에만 재시도한다.” |
| `backend.core.concurrency-transaction.usecase-transaction.q3` | SCENARIO | 하나의 중심 판단으로 수렴해 모델답변·설명으로 직접 대조 가능: “아니다. DB와 broker는 별도 resource이므로 outbox 같은 durable handoff나 reconciliation이 필요하다.” |
| `database.core.transaction.acid.q1` | SCENARIO | 하나의 중심 판단으로 수렴해 모델답변·설명으로 직접 대조 가능: “아니다. DB transaction atomicity는 해당 DB 변경 경계를 보호하며 이미 외부 시스템에 발생한 side effect까지 rollback하지 않는다. 결제 취소/보상, idempotency, 상태 기록 같은 별도 분산 실패 설계가 필요하다.” |
| `spring.core.transaction-aop.transaction-proxy.q2` | SCENARIO | 하나의 중심 판단으로 수렴해 모델답변·설명으로 직접 대조 가능: “target method 실행과 transaction completion은 분리되어 있다. JPA flush/DB constraint 확인이 method 종료 또는 commit 과정까지 지연될 수 있고 proxy/interceptor가 target 정상 반환 뒤 commit을 수행하므로 save line 통과만으로 commit 완료를…” |
| `operating-systems.core.virtual-memory.page-frame.q3` | SCENARIO | 하나의 중심 판단으로 수렴해 모델답변·설명으로 직접 대조 가능: “ceil(100/16)=7 page가 필요해 112KiB가 page 단위로 확보된다. 마지막까지 합쳐 최대 12KiB가 이 단순 계산에서 사용되지 않는 공간이다.” |
| `network-http.core.request-journey.origin.q2` | DESCRIPTIVE | 하나의 중심 판단으로 수렴해 모델답변·설명으로 직접 대조 가능: “origin tuple의 scheme이 `https`와 `http`로 다르기 때문이다. 같은 DNS address나 HTTP Host를 사용해도 scheme·host·port tuple이 다르면 browser의 same-origin/CORS 판단에서 별개 origin이다.” |

### Cases where separate criteria add little

- `backend.core.concurrency-transaction.optimistic.q3` (SCENARIO): the read/update sequence is context for one optimistic-conflict outcome and its response; numbering does not create separate answer axes.
- `backend.core.concurrency-transaction.usecase-transaction.q3` (SCENARIO): the DB-commit/message-publish ordering frames one local-transaction boundary and recovery judgment.
- `database.core.transaction.acid.q1` (DESCRIPTIVE): the rollback timeline tests one boundary—database atomicity does not undo an external payment side effect.
- `spring.core.transaction-aop.transaction-proxy.q2` (SCENARIO): the save/return/commit timeline supports one distinction between target method execution and proxy-managed completion.
- `operating-systems.core.virtual-memory.page-frame.q3` (SCENARIO): one ceiling division yields the page count and internal-fragmentation result.

### Schema decision

The re-review retains 357 concrete structured-self-check candidates spanning all 15 LearningAreas, with row-specific evidence rather than a prompt-shape proxy. The retained examples cover distinct answer structures such as independent failure boundaries, multiple measurements and SLO decisions, security checks at separate request stages, and architecture ownership/recovery obligations. This establishes cross-area recurrence and plausible partial-answer value; it is a meaningful signal for a separate structured-self-check product/design decision.

It does not make an `evaluationPoints[]` schema necessary to complete Issue #167’s audit and correction deliverable: the issue requires inventory, content correction, classification, evidence, and import/history safety checks, not criterion persistence or criterion-level learner state. No learner outcome data in this repository can establish that persisted criteria outperform direct comparison with the current modelAnswer/explanation. Therefore this PR records the recommendation for a separate follow-up to validate criterion-level learner state and UI against actual learning use; it does not add `evaluationPoints[]`, scoring, rubric entities, migrations, API, or UI.

`MODEL_ANSWER_SUFFICIENT` examples show why a global rubric is not useful for every prompt: a single transaction boundary, one protocol distinction, or one bounded calculation remains directly checkable from prose.

## Identity and history

- Compared with `origin/main`, all 2,525 canonical Question contentKeys remain present; 0 added, 0 removed, 0 type/status changes. For the 1,159 target set, area/type/status identity is unchanged.
- Import integration validation uses the disposable Testcontainers database. It imports the canonical pack, previews all batches with zero errors, applies successfully, repeats the exact content as `UNCHANGED`, and compares all Question IDs. It seeds Attempt, WrongNote, ReviewSchedule, and ReviewHistory on a corrected Question, applies a temporary same-key content revision, restores the canonical pack, and verifies those history IDs, the Question ID, Concept-link count, and canonical explanation remain intact. No production DB was accessed.

## Result / Wrong Note self-check regression review

Existing `QuizResultPage` and `WrongNoteDetailPage` render the user's response, model answer, optional explanation, and related Concept navigation for non-MC/non-short-answer types. The corresponding component tests exercise existing model-answer/explanation presentation. This change touches canonical content only; no Result/Wrong Note regression or field contract was altered.

## Validation

- **Full canonical deterministic audit: PASS.** 2,525 canonical Questions; 1,159 unique PUBLISHED DESCRIPTIVE/SCENARIO rows; modelAnswer/explanation completeness, target identity, required fields, scalar answer shape, Concept link, difficulty, duplicate keys and stable type/status all passed. The matrix has 802 `MODEL_ANSWER_SUFFICIENT`, 357 `STRUCTURED_CRITERIA_USEFUL` with 357 distinct row-specific bases, and 0 residual `CONTENT_FIX_ONLY`.
- **Preview → Apply → exact reimport: PASS.** `CanonicalBootstrapIdempotencyIntegrationTest` ran against disposable PostgreSQL/Testcontainers. Canonical bootstrap applied with zero errors; batch previews had zero errors and exact items were `UNCHANGED`; exact bootstrap reimport was unchanged. Same-key temporary revision/restore preserved Question ID, Attempt, WrongNote, ReviewSchedule, ReviewHistory, Concept links, and explanation. No production DB was accessed.
- **Backend tests: PASS.** `./gradlew.bat test --rerun-tasks --no-daemon --stacktrace` (33 test classes / 119 tests, 0 failures). Focused canonical import/history integration test also passed.
- **Backend build: PASS.** `./gradlew.bat build --no-daemon --stacktrace`.
- **Frontend: PASS.** `npm ci`, `npm run lint`, `npm test` (28 files / 84 tests), and `npm run build`.
- **Compose validation: PASS.** `docker compose config --quiet`; production config with `POSTGRES_PASSWORD=validation-secret`; expected production-config failure without the secret.
- **Repository validation: PASS.** All `validate` job steps in `.github/workflows/repository-validation.yml` passed; deployment job was not run.
- **`git diff --check`: PASS.**
