# Curriculum Alignment & Quality Audit — Phase A

## Baseline

- Repository: `guseoh/csforge`
- Baseline: `d021928aabfae4fc2c978134c52415ce7dc39d0e` (`origin/main`)
- Scope: audit evidence only
- Authoritative shared contracts: `content/AGENTS.md`, then `content/README.md`
- Area-specific planning source: each `content/curriculum/*.yaml`
- Compared implementation: `content/{area}/topics.json`, Concept Markdown, and `questions.json`

No curriculum YAML, canonical Topic/Concept/Question, reference metadata, runtime, application code, or workflow was changed by this phase.

## Method

The audit parsed all 15 curriculum YAML files and every canonical Topic, Concept front matter/body, and Question file from the baseline. Counts were recalculated from source rather than copied from an earlier report. Structural checks covered key parity, ownership, level, order, prefix, prerequisites, cycles, and Question-to-Concept links. Question coverage was aggregated per Concept, Topic, Area, type, and difficulty.

The qualitative pass followed the requested order: Java, Spring, Database, Backend Engineering, Network & HTTP, Operating Systems, Computer Architecture, Data Structures & Algorithms, Security, Cache, Messaging & Async Processing, Infrastructure & Cloud, Performance / Observability / Operations, Distributed Systems, and System Design. For each Area, curriculum objectives and metadata were compared with the canonical body and linked Question prompts/answers. The review looked for missing objective clauses, misplaced responsibility, material level/density mismatch, meaningful visualization gaps, and untested objective behavior. It did not create findings from article length, wording preference, or the absence of one question at every difficulty.

The machine-readable companion records every Concept's Question count and observed type/difficulty set, every Topic's coverage distribution, all structural check arrays, the findings below, and the cross-Area ownership decisions.

## Repository-wide inventory

| LearningArea | Topics curriculum/canonical | Concepts curriculum/canonical | Questions | Question types (MC/SA/D/S) | Difficulty (E/M/H) |
| --- | ---: | ---: | ---: | ---: | ---: |
| Computer Architecture | 10 / 10 | 61 / 61 | 183 | 61 / 14 / 49 / 59 | 61 / 61 / 61 |
| Data Structures & Algorithms | 12 / 12 | 84 / 84 | 293 | 48 / 62 / 87 / 96 | 86 / 158 / 49 |
| Operating Systems | 12 / 12 | 97 / 97 | 331 | 86 / 19 / 126 / 100 | 99 / 173 / 59 |
| Network & HTTP | 15 / 15 | 127 / 127 | 381 | 127 / 0 / 127 / 127 | 126 / 211 / 44 |
| Database | 12 / 12 | 38 / 38 | 75 | 13 / 22 / 19 / 21 | 18 / 48 / 9 |
| Java | 18 / 18 | 145 / 145 | 841 | 767 / 1 / 32 / 41 | 262 / 415 / 164 |
| Spring | 12 / 12 | 37 / 37 | 77 | 23 / 10 / 20 / 24 | 21 / 48 / 8 |
| Backend Engineering | 13 / 13 | 40 / 40 | 108 | 35 / 0 / 36 / 37 | 30 / 61 / 17 |
| Cache | 3 / 3 | 9 / 9 | 27 | 8 / 1 / 9 / 9 | 9 / 10 / 8 |
| Messaging & Async Processing | 3 / 3 | 9 / 9 | 27 | 8 / 0 / 10 / 9 | 8 / 10 / 9 |
| Infrastructure & Cloud | 3 / 3 | 9 / 9 | 27 | 6 / 3 / 9 / 9 | 9 / 9 / 9 |
| Performance / Observability / Operations | 3 / 3 | 9 / 9 | 27 | 6 / 3 / 9 / 9 | 9 / 9 / 9 |
| Distributed Systems | 3 / 3 | 9 / 9 | 27 | 6 / 1 / 11 / 9 | 7 / 11 / 9 |
| System Design | 3 / 3 | 9 / 9 | 27 | 6 / 3 / 9 / 9 | 9 / 9 / 9 |
| Security | 12 / 12 | 38 / 38 | 73 | 10 / 17 / 24 / 22 | 12 / 53 / 8 |
| **Total** | **134 / 134** | **721 / 721** | **2,524** | **1,210 / 156 / 577 / 581** | **766 / 1,286 / 472** |

`MC`, `SA`, `D`, and `S` mean `MULTIPLE_CHOICE`, `SHORT_ANSWER`, `DESCRIPTIVE`, and `SCENARIO`. The absence of a type or difficulty in one Topic, Area, or Concept is not itself a defect; coverage is judged against the objectives and the current Topic/LearningArea contract.

## Structural parity summary

- 15/15 curriculum YAML files parsed successfully.
- Curriculum and canonical totals match at 134 Topics and 721 Concepts.
- 14/15 Areas have full structural parity.
- All 2,524 Questions link to at least one existing Concept.
- Every canonical Concept has at least one linked Question.
- No duplicate Topic, Concept, or Question key was found within an Area or repository-wide.
- No duplicate Topic order or per-Topic Concept order was found.
- No missing/orphan Topic or Concept key was found.
- No primary Topic or content-key prefix mismatch was found.
- No invalid prerequisite target or same-Area prerequisite cycle was found.
- One level mismatch exists: `operating-systems.core.ipc.shared-memory` is L2 in the curriculum and L1 in canonical front matter.

The `dsa` directory and `dsa.core` prefix intentionally map to the canonical Area slug `data-structures-algorithms`; this is not an ownership mismatch.

## Policy drift

Four policy/documentation findings need Phase B attention, without changing current Questions to satisfy the old numbers.

1. `java.yaml` still declares `everyConcept.minimumByDifficulty`, `minimumTotal`, density-based question ranges, and MULTIPLE_CHOICE-first wording. `content/curriculum/README.md` repeats those rules. The current `content/README.md` explicitly labels the per-Concept fields legacy and makes counts an output of learning design.
2. Backend Engineering, Database, Security, and Spring still declare `question.minimumPerConcept: 2`. The current contract rejects a per-Concept quota even though the current two-question sets were found to cover their objectives adequately.
3. `areaTypeCoverage` and `topicDifficultyCoverage` remain useful only as review dimensions. They must not be interpreted as an obligation to manufacture every type/difficulty when it adds no learning value.
4. `content/curriculum/README.md` is titled and written as a Java-only foundation document, while the directory now owns all 15 V1 foundations.

The visualization value set, Korean authoring direction, layer-boundary guidance, primary-source preference, and selective prerequisite policy are otherwise consistent with the current shared contracts.

## LearningArea audits

### Computer Architecture

- Inventory: 10 Topics, 61 Concepts, 183 Questions.
- Structural parity: PASS.
- Policy drift: none beyond directory-wide documentation context.
- Objective alignment: no P0/P1 gap. The canonical bodies distinguish ISA/microarchitecture, cache hierarchy, MMU/TLB translation, multicore coherence, device I/O, and performance reasoning at the planned depth.
- Question coverage: all Concepts are linked; Topic coverage includes contract checks, calculation/state flow, hardware trade-offs, and scenarios. The exact 61/61/61 difficulty distribution is an observed result, not a required template.
- Boundary/ownership: owns MMU/TLB and hardware memory/coherence; OS policy and JMM guarantees are kept outside its deep-theory responsibility.
- Findings: P0 0, P1 0, P2 0.

### Data Structures & Algorithms

- Inventory: 12 Topics, 84 Concepts, 293 Questions.
- Structural parity: PASS.
- Policy drift: none.
- Objective alignment: no P0/P1 gap across complexity, sequential structures, hashing, trees, search/sort, recursion, graphs, greedy, DP, and selection.
- Question coverage: all Concepts are linked; invariant/correctness, operation state, counterexample, complexity, and constraint-driven selection are represented.
- Boundary/ownership: algorithm/data-structure theory remains here; Java collection/API use remains in Java.
- Finding: P2 `CAA-PA-005` notes missing explicit visualization for pruning and overlapping subproblems despite `DIAGRAM` metadata.
- Findings: P0 0, P1 0, P2 1.

### Operating Systems

- Inventory: 12 Topics, 97 Concepts, 331 Questions.
- Structural parity: FINDING because of one level mismatch; key/link/order/prerequisite parity otherwise passes.
- Policy drift: none.
- Objective alignment and Question coverage: no separate P0/P1 content gap. Kernel boundaries, process/thread state, scheduling, synchronization, deadlock, virtual memory, filesystem, I/O, IPC, and isolation objectives are exercised by state/flow and failure scenarios.
- Boundary/ownership: owns process/thread scheduling, paging policy/working set, and OS primitives; Java/JMM and hardware translation remain linked but separate.
- Finding: P1 `CAA-PA-001` — `operating-systems.core.ipc.shared-memory` is curriculum L2 but canonical L1. Its actual synchronization, layout, and crash-lifecycle reasoning supports the curriculum's L2 classification.
- Findings: P0 0, P1 1, P2 0.

### Network & HTTP

- Inventory: 15 Topics, 127 Concepts, 381 Questions.
- Structural parity: PASS.
- Policy drift: none.
- Objective alignment: no P0/P1 gap across layering, local delivery/routing, DNS, TCP/UDP, TLS, request journey, HTTP messages/methods/status/versions/cache/state/intermediaries.
- Question coverage: all Concepts have MC, descriptive, and scenario coverage at Area level; no SHORT_ANSWER is required because the objectives predominantly ask for protocol state and boundary reasoning.
- Boundary/ownership: owns TLS transport and HTTP cache semantics; authentication/session protection is Security's responsibility and application cache strategy is Cache's responsibility.
- Finding: P2 `CAA-PA-006` records seven `DIAGRAM` entries whose canonical bodies have prose but no explicit diagram or equivalent visualization.
- Findings: P0 0, P1 0, P2 1.

### Database

- Inventory: 12 Topics, 38 Concepts, 75 Questions.
- Structural parity: PASS.
- Policy drift: affected by P1 `CAA-PA-003` (`minimumPerConcept: 2`).
- Objective alignment: no P0/P1 gap. SQL/model/schema/index/optimizer/transaction/isolation/locking/MVCC/storage/query/replication responsibilities match their objectives.
- Question coverage: the two-question pattern is not automatically a defect; current questions cover the decisive state, SQL, timeline, or trade-off for each objective.
- Boundary/ownership: owns transaction, isolation, MVCC, locking, and persistence semantics; Spring owns proxy-based transaction abstraction.
- Findings: P0 0, P1 1, P2 0.

### Java

- Inventory: 18 Topics, 145 Concepts, 841 Questions.
- Structural parity: PASS.
- Policy drift: P1 `CAA-PA-002` covers legacy per-Concept difficulty/count quotas and MC-first wording.
- Objective alignment: no P0/P1 gap. Language, object/API contracts, collections/generics, exceptions, functional/stream APIs, modern language features, time/I/O, concurrency, JVM, diagnostics, and compatibility stay within their planned responsibilities.
- Question coverage: broad code/result, contract, misconception, and scenario coverage exists. The heavy MC distribution is an inventory fact; future authors should not treat it as a mandatory ratio.
- Boundary/ownership: owns Java language/JMM/JVM contracts and Java APIs, while OS scheduling and production incident response remain in their primary Areas.
- Findings: P0 0, P1 1, P2 0.

### Spring

- Inventory: 12 Topics, 37 Concepts, 77 Questions.
- Structural parity: PASS.
- Policy drift: affected by P1 `CAA-PA-003` (`minimumPerConcept: 2`).
- Objective alignment: no P0/P1 gap across container, registration/injection, scope/lifecycle, configuration, MVC, validation/errors, Data JPA, transaction AOP, testing, and production behavior.
- Question coverage: the linked questions test framework call paths, proxy/lifecycle state, query/transaction effects, and operational boundaries rather than merely restating titles.
- Boundary/ownership: owns Spring abstractions and proxy behavior; database theory and Java reflection/concurrency mechanisms remain with their primary Areas.
- Findings: P0 0, P1 1, P2 0.

### Backend Engineering

- Inventory: 13 Topics, 40 Concepts, 108 Questions.
- Structural parity: PASS.
- Policy drift: affected by P1 `CAA-PA-003` (`minimumPerConcept: 2`).
- Objective alignment: no P0/P1 gap across API/layer/domain/validation/list/idempotency/concurrency/external/retry/batch/evolution/testing responsibilities.
- Question coverage: request/DB state, retry/idempotency races, pagination, recovery, and migration trade-offs are tested; no SHORT_ANSWER quota is needed.
- Boundary/ownership: applies database, cache, messaging, and distributed mechanisms at the application boundary without replacing their deep theory.
- Findings: P0 0, P1 1, P2 0.

### Cache

- Inventory: 3 Topics, 9 Concepts, 27 Questions.
- Structural parity: PASS.
- Policy drift: none. Area/type and difficulty lists should remain coverage dimensions, not quotas.
- Objective alignment and Question coverage: no P0/P1 gap. Cache-aside/write strategies, key design, freshness/invalidation/stampede, eviction/hot-key/degraded mode are covered through failure order and source-of-truth reasoning.
- Boundary/ownership: owns application/distributed cache strategy; HTTP freshness/validators remain in Network & HTTP, and architecture composition remains in System Design.
- Findings: P0 0, P1 0, P2 0.

### Messaging & Async Processing

- Inventory: 3 Topics, 9 Concepts, 27 Questions.
- Structural parity: PASS.
- Policy drift: none. The declared Area type list must not be treated as a demand to add SHORT_ANSWER mechanically.
- Objective alignment and Question coverage: no P0/P1 gap. Partition/offset, delivery/idempotency/retry/DLQ/ordering, outbox/backpressure/schema evolution are covered with message timelines and failure scenarios.
- Boundary/ownership: owns broker delivery and recovery semantics; generic partial failure/coordination theory remains in Distributed Systems.
- Findings: P0 0, P1 0, P2 0.

### Infrastructure & Cloud

- Inventory: 3 Topics, 9 Concepts, 27 Questions.
- Structural parity: PASS.
- Policy drift: none.
- Objective alignment and Question coverage: no P0/P1 gap. Compute/resource/configuration, network/ingress/DNS-TLS operation, storage/backup/IaC rollout objectives have balanced operational scenarios.
- Boundary/ownership: treats DNS/TLS as deployment and lifecycle responsibilities rather than re-teaching protocol theory owned by Network & HTTP/Security.
- Findings: P0 0, P1 0, P2 0.

### Performance / Observability / Operations

- Inventory: 3 Topics, 9 Concepts, 27 Questions.
- Structural parity: PASS.
- Policy drift: none.
- Objective alignment and Question coverage: no P0/P1 gap. Latency/throughput, saturation, profiling/load testing, signal correlation, SLI/SLO, cardinality, alert/runbook, incident, and capacity decisions are tested as operational feedback loops.
- Boundary/ownership: owns measurement and production response; Java/OS retain ownership of runtime mechanisms that produce the evidence.
- Findings: P0 0, P1 0, P2 0.

### Distributed Systems

- Inventory: 3 Topics, 9 Concepts, 27 Questions.
- Structural parity: PASS.
- Policy drift: none.
- Objective alignment and Question coverage: no P0/P1 gap. Clocks/deadlines, partial failure/detection, replication/quorum/leader, leases/fencing, saga, and CAP are covered with explicit limits and recovery decisions.
- Boundary/ownership: owns partial failure, consistency, and coordination theory; Messaging owns broker delivery mechanics and System Design owns composition against product constraints.
- Findings: P0 0, P1 0, P2 0.

### System Design

- Inventory: 3 Topics, 9 Concepts, 27 Questions.
- Structural parity: PASS.
- Policy drift: none.
- Objective alignment and Question coverage: no P0/P1 gap. Requirements/capacity/ownership, sync-async/read-write/modularity, failure budget/isolation/rollout are tested as requirement-driven trade-offs.
- Boundary/ownership: synthesizes mechanisms rather than duplicating cache, messaging, database, or distributed-systems deep theory.
- Findings: P0 0, P1 0, P2 0.

### Security

- Inventory: 12 Topics, 38 Concepts, 73 Questions.
- Structural parity: PASS.
- Policy drift: affected by P1 `CAA-PA-003` (`minimumPerConcept: 2`).
- Objective alignment: no P0/P1 gap across threat/trust, authentication/authorization, password/session/browser/injection/access, filter/auth/context, token/OAuth, and abuse boundaries.
- Question coverage: P1 `CAA-PA-007` — `security.core.authn-authz.authentication` has two useful Questions for authentication-vs-authorization separation and user-enumeration-safe failure responses, but neither directly tests the Curriculum objective's central credential-verification → authenticated identity/`SecurityContext` formation flow. Other reviewed Security objectives have adequate linked coverage without treating two Questions as a permanent quota.
- Boundary/ownership: owns authentication, session/token, browser/application security, and Spring Security filter/`SecurityContext` integration; Network & HTTP owns TLS/HTTP transport, while Spring owns the DispatcherServlet/controller MVC dispatch boundary.
- Findings: P0 0, P1 2, P2 0.

## Cross-LearningArea ownership

No P0/P1 cross-Area ownership finding was identified. The machine evidence records all reviewed boundaries as `ALIGNED` with representative Concept keys.

| Boundary | Result |
| --- | --- |
| MMU/TLB: Computer Architecture ↔ Operating Systems | Hardware translation is owned by Computer Architecture; paging policy and working set by OS. |
| process/thread/scheduling: Operating Systems ↔ Java | OS owns process/thread/scheduler theory; Java owns Thread APIs and JVM/runtime mapping. |
| JMM/happens-before: Java ↔ Operating Systems | Java owns JMM guarantees; OS supplies generic race/synchronization foundations. |
| transaction/isolation: Database ↔ Spring | Database owns isolation/MVCC/locking; Spring owns transaction proxy abstraction and rollback rules. |
| HTTP cache: Network & HTTP ↔ Cache | Network owns protocol cache semantics; Cache owns application/distributed cache behavior. |
| cache composition: Cache ↔ System Design | Cache owns mechanisms; System Design owns requirement-driven placement and architecture choice. |
| delivery/retry: Messaging ↔ Distributed Systems | Messaging owns broker delivery/offset/retry; Distributed Systems owns generic partial-failure theory. |
| consistency/composition: Distributed Systems ↔ System Design | Distributed Systems owns theory; System Design combines it against product constraints. |
| runtime diagnosis: Java/OS ↔ Performance/Operations | Java/OS explain runtime evidence; Performance/Operations owns measurement and response. |
| TLS/authentication/session: Network ↔ Security ↔ Spring MVC | Network owns TLS/HTTP transport; Security owns authentication/session/browser controls and Spring Security filter/`SecurityContext` integration; Spring owns DispatcherServlet/controller MVC dispatch. |

## P0 findings

None.

## P1 findings

1. `CAA-PA-001` — Operating Systems shared-memory level mismatch (curriculum L2, canonical L1).
2. `CAA-PA-002` — Java per-Concept difficulty/count quota and MC-first policy drift.
3. `CAA-PA-003` — `minimumPerConcept: 2` remains in Backend Engineering, Database, Security, and Spring.
4. `CAA-PA-004` — the curriculum directory README is still Java-only and repeats legacy policy.
5. `CAA-PA-007` — Security authentication Question coverage does not directly test the credential-verification → authenticated identity/`SecurityContext` formation path required by the Learning Objective.

## P2 observations

1. `CAA-PA-005` — DSA pruning and overlapping-subproblems declare `DIAGRAM` but have no explicit visualization.
2. `CAA-PA-006` — seven Network & HTTP Concepts declare `DIAGRAM` but have no explicit visualization: UDP delivery/order, UDP application reliability, PKI, TLS handshake, TLS termination, HTTP header/content layering, and PUT replacement flow.

These observations do not automatically enter Phase B and do not justify broad rewrites.

## Recommended Phase B scope

Keep Phase B narrow and contract-focused:

1. Confirm and align the shared-memory level metadata, preserving its canonical `contentKey` and body.
2. Remove or explicitly deprecate Java's legacy per-Concept difficulty/count quotas and MC-first default.
3. Remove `minimumPerConcept` from Backend Engineering, Database, Security, and Spring; retain objective and Topic/Area coverage guidance.
4. Rewrite `content/curriculum/README.md` as a 15-area foundation index that defers shared rules to the authoritative content contracts.
5. Do not add, delete, or rewrite Questions merely to satisfy old numeric fields.

## Recommended Phase C scope

After Phase B contract cleanup:

1. Address P1 `CAA-PA-007` with the minimum necessary Security Question change so the authentication Learning Objective directly tests credential verification → authenticated identity/`SecurityContext` formation. Do not introduce a new per-Concept quota.
2. Review the nine P2 visualization candidates. Add a compact diagram or text-first visualization only where it materially improves search-tree, repeated-subproblem, packet/order, trust-chain, handshake, termination, HTTP layering, or state-replacement understanding.

No broad canonical Concept or Question rewrite is recommended from this Phase A evidence.
