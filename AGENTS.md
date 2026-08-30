# CSForge Agent Instructions

## 1. Product goal
CSForge is a local-first, single-user CS/backend learning application built primarily through Codex-assisted development.

The product exists to make daily learning convenient: learn concepts, solve questions, review wrong answers, schedule review, search accumulated knowledge, and import content in bulk.

Primary flow:

`Dashboard -> Learning Areas -> Concept -> Quiz -> Result -> Wrong Notes -> Review -> Search`

Content management flow:

`Markdown/JSON -> Validate -> Preview/Diff -> Import -> PostgreSQL -> async indexing`

## 2. Current hard constraints
- Local-only V1. No cloud deployment.
- Single user. No Member domain, signup, login, OAuth, JWT, roles, or Spring Security unless a later task explicitly changes this.
- No desktop/laptop data synchronization in V1.
- PostgreSQL is the source of truth. Elasticsearch, Redis, and Kafka data must be rebuildable or recoverable from canonical data/events.
- Keep the app usable even when optional derived infrastructure such as search/cache is unavailable where practical.
- Do not introduce paid infrastructure or services as a requirement.

## 3. Baseline stack
Backend:
- Java 25
- Spring Boot 4.1.x
- Gradle
- Spring MVC
- Spring Data JPA / Hibernate
- Bean Validation
- Flyway
- Spring Kafka
- Spring AI when AI features are implemented
- Actuator / Micrometer

Frontend:
- React
- TypeScript
- Vite
- PWA
- TanStack Router
- TanStack Query
- React Hook Form
- Zod

Local infrastructure:
- PostgreSQL
- Elasticsearch with Nori for Korean search
- Kafka
- Redis
- Prometheus
- Grafana
- Docker Compose

Later infrastructure may include ClickHouse, OpenTelemetry, Loki, and Tempo when their actual product/observability responsibilities are implemented. Do not add them merely as empty dependencies.

## 4. Repository shape
Prefer a simple monorepo:

```text
csforge/
├─ backend/
├─ frontend/
├─ content/
├─ infra/
├─ docs/
└─ compose.yaml
```

Start with one Spring Boot application. Keep domain/module boundaries clear enough to split runtime responsibilities later, but do not create separate API/worker applications or duplicate Gradle projects without an actual need.

Suggested backend feature packages:
- learning
- question
- quiz
- review
- note
- search
- ai
- importcontent
- dashboard
- global

Avoid ceremonial layers and abstractions that do not protect a real boundary.

## 5. Engineering rule: do not intentionally build a weak first version
Do not omit normal application quality just because the task is called MVP.

When applicable from the first implementation, include:
- pagination
- filtering
- sorting
- stable ordering
- reasonable page-size limits
- database indexes derived from known query patterns
- uniqueness and foreign-key constraints
- idempotent imports
- bulk operations for bulk workflows
- retry/recovery where a workflow can reasonably fail
- autosave/resume for frequently used learning flows
- useful loading, empty, and error states
- keyboard/search convenience where it materially improves daily use

For append-heavy/history data, consider cursor/keyset pagination rather than forcing offset pagination everywhere. For Elasticsearch deep paging, design with `search_after` when appropriate.

Performance measurement is used to validate and refine an already reasonable design, not to justify intentionally shipping missing pagination/indexes first.

## 6. Engineering rule: avoid unnecessary and repetitive work
The previous rule is not permission to over-engineer.

Avoid unless a task has a concrete reason:
- duplicate applications/modules that repeat configuration
- every-CRUD-is-an-event designs
- generic abstractions used by only one case
- speculative frameworks or libraries with no product responsibility
- duplicated DTO/domain models without a boundary that requires them
- documentation that repeats existing canonical documentation without adding a decision or contract
- tests that only mirror implementation details and provide no behavior confidence

Use the smallest structure that cleanly supports the currently approved behavior.

## 7. Engineering rule: formatting and modern stack guardrails
Code hygiene is part of task completion, not an optional cleanup pass.

For every task that changes code:
- format all changed source files before final validation;
- run the repository's formatter/format-check command for every language touched when one exists;
- if a language has no repeatable formatter yet and the task materially changes that codebase, establish one lightweight, maintained formatter once and reuse it in later tasks;
- keep formatter configuration centralized and avoid duplicate style tools that solve the same problem;
- do not mass-reformat unrelated files merely to satisfy formatting;
- lint/type-check/build/test should run after formatting so validation reflects the final files.

Use the currently approved stack rather than introducing older or parallel persistence/framework styles by convenience.

Backend persistence baseline:
- JPA/Hibernate and Spring Data JPA are the default persistence APIs for canonical application data.
- Do not introduce raw JDBC, `JdbcTemplate`, `NamedParameterJdbcTemplate`, direct `Connection`/`PreparedStatement`, MyBatis, or another parallel persistence stack unless the current task has a concrete requirement that JPA cannot reasonably satisfy and the user explicitly approves the exception.
- Native SQL through JPA is allowed for a clearly justified PostgreSQL-specific or query-specific need, but it must not become the default CRUD/repository style.
- Prefer JPA projections, JPQL, Criteria/Specification, or a maintained JPA-compatible query approach that fits the actual query before bypassing the selected persistence stack.

General technology rule:
- do not introduce deprecated APIs, end-of-life libraries, old framework idioms, or superseded configuration styles when the selected current stack provides a supported replacement;
- do not downgrade or replace an approved technology with an older alternative simply because it is easier for the agent to generate;
- before adding a new framework/library, inspect the existing project stack and use a current maintained option compatible with it;
- when a legacy/low-level API is genuinely required for a specific capability, keep its use narrow and document the concrete reason in the change, not as a speculative abstraction.

## 8. Core V1 domain rules
- Learning structure: `LearningArea -> Topic -> Concept`.
- Concept levels are `1`, `2`, `3`.
- Question difficulty is separate from Concept level.
- A Question should be connected to at least one Concept.
- Wrong notes are grouped by Question, while every Attempt remains historical data.
- V1 spaced review operates on Questions with the baseline sequence `1d -> 3d -> 7d -> 14d`; a wrong review returns to the first stage.
- A correct answer may still enter review when the user explicitly marks `review needed`.
- AI output is supporting information, not canonical answer/content data.
- AI-generated questions enter Draft/Review before becoming canonical Question data.
- Content imports use stable external/content keys and must be idempotent.

## 9. Search and async rules
- PostgreSQL owns canonical Concept, Question, Note, Attempt, WrongNote, Review, and AI-analysis records.
- Elasticsearch owns search projections only.
- Kafka is for workflows that benefit from asynchronous processing, such as search indexing, AI analysis, and analytics events. Do not route simple synchronous CRUD through Kafka without a reason.
- When DB state and Kafka publication must stay consistent, use a transactional outbox rather than dual writes.

## 10. Codex task workflow
For every task:
1. Read this file and relevant docs before changing code.
2. Inspect the current repository state; do not assume previous prompts were applied.
3. Make only the delta required by the current task plus directly necessary supporting changes.
4. Preserve existing decisions unless the task explicitly changes them.
5. Format changed code before validation and do not leave formatter/lint changes for a later cleanup task.
6. Run the smallest meaningful validation first, then the broader project validation appropriate to the change.
7. Report changed behavior, validation results, and any remaining limitation briefly.
8. Do not commit, push, open a PR, or modify unrelated files unless the task explicitly asks for it.

Prefer one complete vertical change over repeated tiny edits that create avoidable churn.
