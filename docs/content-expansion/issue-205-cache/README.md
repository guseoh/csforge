# Issue #205 — Cache L1/L2 기존 범위 대조 및 확장 검토

## Curriculum / Source
- Base main: `c4cb06806a67e4ac710b430889f26ad4deed5739`.
- Existing Cache: 3 Topic / 9 Concept / 27 Question. Prior #204 Area review KEEP; existing `cache-aside`, `invalidation`, `ttl-freshness`, `hot-key`, `stampede` and `availability-degraded-mode` already own their objectives.
- Gap: **independent per-instance L1 copies, shared Redis L2, invalidation-channel disconnect and reconnect** as an end-to-end failure state are not a standalone previous objective. New concept `cache.core.models.local-shared-cache`, Level 2/CORE, original Topic order 40, DIAGRAM (meaningful inline ASCII); no new Topic or optional Redis deployment.
- Existing 9 Concept/27 Question unchanged; adds exactly **1 Concept + 3 Question** (MC/EASY, SCENARIO/MEDIUM, DESCRIPTIVE/HARD), all linked to the new concept. Review the MC's only correct choice **B**; scenario distinguishes lost L1 notification from DB→L2 invalidation failure; HARD requires correctness/cost tradeoff.
- Reference verified against [Redis client-side caching reference](https://redis.io/docs/latest/develop/reference/client-side-caching/) (L1 invalidation + drop cache on disconnected notification stream) and [Spring Cache Abstraction](https://docs.spring.io/spring-framework/reference/integration/cache.html). Client tracking is optional and is not equivalent to PostgreSQL commit propagation.
- Diagram in Markdown explicitly distinguishes per-JVM L1, shared L2, canonical DB and old/new state/time ordering. There is no new external image (no new ALT/theme asset requirement). **Human Usage Check omitted per user decision, not counted as executed.**

## Isolated PostgreSQL 16.4 and Java 25 QA
- [Actions #39549678094](https://github.com/guseoh/csforge/actions/runs/39549678094) **SUCCESS**: prepare actual old 3,380-item source; local Spring Boot session mode LOCAL; canonical 3,380 CREATED; new Pack multipart Preview/Apply **4 CREATED + 9 existing Question UNCHANGED**, 0 ERROR; exact file replay **13 UNCHANGED / 0 UPDATED**.
- Existing Concept and Question numeric IDs, historic WrongNote, ReviewSchedule, Quiz result, personal and wrong-note content preserved; **10 personal/history/reference/relation table filtered digests** equal before and after. New MC graded correct using real Quiz API.
- Production DB never connected or imported. One-off QA workflow removed after success and evidence retained in Actions.
- Adding new canonical items requires updating regression tests that had hard-coded `3,380/721/2,525/870` inventory expectations. They now reference **one central test-only `CanonicalInventory`** (for Cache alone: 871 files, 722 concepts, 2,528 questions, 3,384 items), avoiding repeating magic counts throughout 16 integration/regression test classes. Existing inventory assertions are preserved, not disabled.

## Gate
- [x] Area full Concept/Question objective review + technical source check
- [x] Real isolated Preview/Apply, exact replay, pre-existing history preservation
- [ ] Final clean HEAD Repository Validation (backend tests/build, frontend, Compose)
- [ ] Final diff, review threads, base drift, mergeable + squash merge
- [ ] Human Usage Check intentionally excluded, Production canonical sync separate
