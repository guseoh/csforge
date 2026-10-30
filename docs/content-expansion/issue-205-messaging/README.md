# Issue #205 — Messaging Kafka Producer acknowledgement / ISR content pack

## Curriculum / Review
- Base main: `c4cb06806a67e4ac710b430889f26ad4deed5739`.
- Existing Messaging: 3 Topic / 9 Concept / 27 Question. Existing `consumer-offset`, `at-least-once-idempotency`, `ordering`, `transactional-outbox`, `retry-dlq` correctly own consumer recovery, business idempotence, ordering, DB/outbox intent and retries. No unnecessary expansion of those Topics or new Kafka infrastructure.
- New gap: Producer-side record acknowledgment and durability condition independent of consumer committed position and business DB commit. Added **one Level 2/CORE Concept** `messaging.core.delivery.producer-ack-durability` (existing delivery Topic order 40, DIAGRAM as inline sequence/ISR state) and **three linked Questions** (MC/EASY, SCENARIO/MEDIUM, DESCRIPTIVE/HARD).
- Objective: `acks=0/1/all`, ISR, `min.insync.replicas`, producer idempotence, delivery timeout and acknowledgement-loss unknown outcome; separate from outbox and consumer-side exactly-once claims. MC answer **C**. Scenario explicitly fixes Kafka 4.2 ELR-disabled behavior; `acks=all` awaits **all current ISR**, not just the minimum 2.
- Verified official sources: [Kafka 4.2 Producer Configs](https://kafka.apache.org/42/configuration/producer-configs/) and [Kafka 4.2 Topic Configs](https://kafka.apache.org/42/configuration/topic-configs/). Existing references/identities unchanged. Producer idempotence is not automatic whole-business exactly-once.
- Inline ASCII diagrams show Producer→leader→ISR follower and split Outbox DB / Producer ack / Consumer DB / offset commit. No external image or new ALT/theme/mobile assets. **Human Usage Check skipped per user approval, not recorded as performed.**

## Real isolated import and history
- [Actions #39549684405](https://github.com/guseoh/csforge/actions/runs/39549684405) **SUCCESS**. Isolated Postgres 16, Java 25 Spring Boot LOCAL, old canonical baseline **3,380 CREATED**. Uploaded new MD + full existing Topic's Question JSON: **4 CREATED + 9 existing Question UNCHANGED**, 0 ERROR. Exact replay **13 UNCHANGED / 0 UPDATED**, new MC correctly graded.
- Existing Concept/Question IDs, historic WrongNote/Review/Quiz/personal note and **10 history/relation filtered digests** unchanged.
- This QA happened against the pre-Cache base and tests **this independent Messaging delta**, not both new concepts together. Following [Cache PR #261](https://github.com/guseoh/csforge/pull/261) merge commit `2a77fb00fb9fc57ffbba56c2c910dd7cfae2616c`, this branch has been reconciled with the latest `main` via a two-parent merge commit. The combined canonical test inventory is **872 source files / 723 Concepts / 2,531 Questions / 3,388 items**. Full combined canonical regression runs in final Repository Validation; independent QA remains historical evidence.
- No production canonical Import; disposable QA workflow removed after success.

## Gate
- [x] Existing Area and new Concept/Question review + primary sources
- [x] Real isolated new Pack Import + exact replay + history/ID protection
- [x] Reconcile with post-Cache main, adjust shared test inventory to the final combined corpus (3,388 items)
- [ ] Final Repository Validation, diff/review threads, squash merge
- [ ] Human Usage Check excluded, not performed
