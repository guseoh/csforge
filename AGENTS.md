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

Prefer package-by-feature with clear internal responsibilities over a repository-wide package-by-layer structure. Avoid ceremonial layers and abstractions that do not protect a real boundary.

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
- interfaces created only because every service/repository is assumed to need one
- design patterns introduced only to make simple code look sophisticated

Use the smallest structure that cleanly supports the currently approved behavior.

## 7. Engineering rule: production Java/Spring implementation quality
Code should look like maintainable production Java/Spring code written by a competent team, not like the shortest implementation an agent can generate. Optimize for clarity, cohesion, changeability, explicit intent, testability, and consistency with the selected stack.

### Persistence
- JPA/Hibernate and Spring Data JPA are the default persistence APIs for canonical application data.
- Do not introduce raw JDBC, `JdbcTemplate`, `NamedParameterJdbcTemplate`, direct `Connection`/`PreparedStatement`, manual `ResultSet`/`RowMapper`, MyBatis, or another parallel persistence stack unless the current task has a concrete requirement that JPA cannot reasonably satisfy and the user explicitly approves the exception.
- Native SQL through JPA is allowed only for a clearly justified PostgreSQL-specific or query-specific need. It must not become the default CRUD or read-model implementation style.
- Prefer entity relationships, Spring Data repositories, JPQL, interface/class projections, fetch joins, entity graphs, Specifications/Criteria, or another maintained JPA-compatible approach that matches the query.
- Do not bypass JPA merely because a large handwritten SQL query is faster for the agent to produce.
- Do not solve N+1 by replacing the read path with JDBC. Design the JPA query deliberately.
- Repository code owns persistence concerns. It must not become a catch-all location for HTTP response shaping, business validation, state transition rules, DTO assembly, and unrelated query helpers.

### Object-oriented design
- Apply encapsulation, abstraction, polymorphism, cohesion, and dependency direction as practical design tools.
- Prefer high cohesion and low coupling. A class should have a clear responsibility and a small set of related reasons to change.
- Protect domain invariants where the state lives. If an entity or value object can prevent an invalid transition itself, do not scatter the same rule across controllers and services.
- Prefer intention-revealing behavior such as `complete()`, `markReviewNeeded()`, `bookmark()`, `unbookmark()`, or `recordView()` over blanket setters and external state manipulation.
- Prefer telling an object to perform behavior over repeatedly reading its state and deciding everything in a procedural service when the behavior naturally belongs to the object.
- Prefer composition over inheritance. Use inheritance only for a real stable is-a relationship with meaningful polymorphic behavior.
- Depend on abstractions at meaningful boundaries, but do not create interfaces for every class. Add an interface when it represents an external boundary, multiple implementations, a real substitution point, or a testing seam with architectural value.
- Prefer immutable values where practical. Use `record` for request/response/value carriers that are genuinely data-oriented, not as a substitute for domain objects that own behavior and invariants.
- Use enums for closed domain concepts. Put behavior on an enum when it cleanly removes duplicated state/type branching.
- Avoid primitive obsession when a value has validation, units, formatting, or domain meaning strong enough to justify a value object. Do not create value objects for trivial values with no behavior or invariant.
- Keep nullability explicit. Prefer required constructor arguments and empty collections over nullable collections. Use `Optional` mainly for return boundaries where absence is meaningful, not as entity fields or method parameters by default.
- Prefer constructor injection and `final` dependencies. Avoid field injection and static mutable state.
- Keep visibility as narrow as practical. Do not make types or methods public solely for convenience.

### Layer and responsibility placement
- Controllers handle HTTP concerns: request parsing, validation boundary, status/response contract, and delegation. They must not contain persistence logic or core business rules.
- Application services coordinate use cases and transaction boundaries. They may orchestrate repositories and domain objects, but should not become procedural god services that own every validation and state rule.
- Domain entities/value objects own state-specific rules and transitions when those rules are intrinsic to the domain.
- Repositories/query components own persistence/query concerns only.
- API request/response mapping may live at the API/application boundary, but avoid mixing persistence row mapping and public API DTO construction in one large class.
- `@Transactional` belongs at the application/use-case boundary unless there is a concrete reason otherwise. Keep controllers transaction-free.
- Use Bean Validation for request-shape constraints and domain methods for domain invariants. Do not repeatedly hand-code the same null/range checks in multiple controllers/services when a maintained validation mechanism fits.
- When time is part of domain policy and deterministic testing matters, prefer an injected `Clock` over scattering `Instant.now()` across business logic. Do not add `Clock` ceremony for incidental timestamps with no test/policy value.

### Branching, methods, and complexity
- Simple `if` statements are fine. Do not eliminate harmless conditionals only to satisfy a style rule.
- Repeated or growing `if/else` or `switch` branches that encode policies, types, or state-dependent behavior should trigger a design review. Consider polymorphism, enum behavior, Strategy, State, Specification, or smaller intention-revealing methods when they actually improve the design.
- Avoid boolean flag parameters that switch a method between unrelated behaviors. Prefer separate intention-revealing methods or a domain type when the distinction matters.
- Keep methods at a consistent abstraction level. Extract methods when they name a real rule or remove mixed responsibilities, not merely to reduce line count.
- Do not create oversized god classes that combine query building, row mapping, validation, orchestration, DTO construction, and domain behavior.
- Large classes/methods are not automatically forbidden, but before finalizing them confirm that their size comes from one cohesive responsibility rather than accumulated unrelated responsibilities.
- Avoid unexplained magic numbers/strings when they represent domain policy. Use named constants, enums, validated request types, or configuration at the appropriate boundary.

### DTO and type design
- Public API DTOs must have names that communicate role and direction. Prefer `ConceptDetailResponse`, `ConceptListItemResponse`, `ConceptProgressUpdateRequest`, `PersonalNoteResponse`, `LearningAreaSummaryResponse` over generic names such as `LearningDtos`, `Data`, `Result`, `Info`, or `Dto` buckets.
- Do not place many unrelated public request/response/projection records inside one large DTO utility class merely to reduce file count.
- Public API request/response types and reusable application projections should normally be top-level named types in the appropriate package.
- Small private helper records/classes may be nested only when they are truly implementation details of the enclosing type and are not shared across boundaries.
- Persistence projections and API responses are different roles. Do not merge them solely to save mapping code when that creates boundary leakage.
- Do not expose JPA entities directly from controllers.

### Design pattern usage
- Apply SOLID and common patterns as problem-solving tools, not as ceremony.
- Before adding Strategy, Factory, Template Method, Chain of Responsibility, Adapter, Facade, Specification, State, or another pattern, identify the concrete variation, boundary, or complexity it addresses.
- Use Strategy/polymorphism when behavior meaningfully varies by policy/type and branching would otherwise keep growing.
- Use factory methods when object creation has invariants, meaningful defaults, or construction policy. Do not hide trivial constructors behind factories without benefit.
- Use Specification/query composition when optional filtering rules need to compose cleanly. Do not build a generic specification framework for one fixed query.
- Use Adapter at external-system/library boundaries when it protects the application from vendor/API details.
- Use State only when state-dependent behavior is substantial enough to justify it; a small enum plus explicit methods is preferable for simple transitions.
- Do not force GoF patterns, DDD tactical patterns, hexagonal architecture, clean architecture, CQRS, or ports/adapters into simple code merely to appear sophisticated.

### Naming and readability
- Name classes and methods after domain/use-case intent rather than implementation mechanics. Prefer `recordConceptView` or `completeConcept` over `process`, `handle`, `executeTask`, or `updateData`.
- Comments should explain why, a trade-off, or a non-obvious constraint. Do not add comments that merely restate readable code.
- Prefer straightforward production code over clever code. A future Java/Spring developer should be able to understand the intent without reverse-engineering agent shortcuts.

### Existing-code migration rule
- Existing code that predates these rules is technical debt, not precedent.
- Do not copy, expand, or use an existing low-level JDBC path, DTO bucket, oversized helper, or similar deviation as justification for new code.
- When a future task directly touches such code, improve it incrementally toward these rules when that can be done safely within the task scope.
- Do not launch a broad unrelated refactor solely to make old code conform. Create an explicit refactor task when the change would materially expand scope or risk.

### Current technology usage
- Use modern Java features supported by the approved Java version when they improve clarity, but do not chase novelty for its own sake.
- Do not introduce deprecated APIs, end-of-life libraries, old framework idioms, or superseded Spring configuration styles when the selected stack provides a supported replacement.
- Do not downgrade or replace an approved technology with an older alternative simply because it is easier for the agent to generate.
- Before adding a new framework/library, inspect the existing project stack and use a current maintained option compatible with it.
- When a legacy or low-level API is genuinely required for a specific capability, keep its use narrow and document the concrete reason in the change.

## 8. Engineering rule: formatting without ritual work
Code style must remain consistent, but formatting must not become token-heavy ceremony.

For every task that changes code:
- changed files must follow the repository formatter/style;
- if formatting is already automatic or integrated into an existing validation command, do not run a duplicate format-check merely for ceremony;
- small changes do not require a whole-repository formatting pass;
- run a dedicated formatter/format-check only when formatter configuration changed, formatting is uncertain, or the repository validation already includes it;
- never mass-reformat unrelated files;
- final lint/type-check/test/build should reflect the actual final files.

## 9. Core V1 domain rules
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

## 10. Search and async rules
- PostgreSQL owns canonical Concept, Question, Note, Attempt, WrongNote, Review, and AI-analysis records.
- Elasticsearch owns search projections only.
- Kafka is for workflows that benefit from asynchronous processing, such as search indexing, AI analysis, and analytics events. Do not route simple synchronous CRUD through Kafka without a reason.
- When DB state and Kafka publication must stay consistent, use a transactional outbox rather than dual writes.

## 11. Codex task workflow
For every task:
1. Read this file and relevant docs before changing code.
2. Inspect the current repository state; do not assume previous prompts were applied.
3. Make only the delta required by the current task plus directly necessary supporting changes.
4. Preserve existing decisions unless the task explicitly changes them.
5. Keep changed code formatted according to repository conventions without adding redundant formatting-only work.
6. Review changed Java/Spring code as production code before validation: persistence-stack compliance, object responsibility, domain invariants, transaction boundaries, validation placement, class/method cohesion, DTO/type naming, unnecessary nested public types, repeated policy branching, and design-pattern misuse or overuse.
7. If an existing implementation violates these rules, do not silently copy the pattern. Either improve the touched portion within scope or report why a separate refactor is safer.
8. Run the smallest meaningful validation first, then the broader project validation appropriate to the change.
9. Report changed behavior, validation results, and any remaining limitation briefly.
10. Do not commit, push, open a PR, or modify unrelated files unless the task explicitly asks for it.

Prefer one complete vertical change over repeated tiny edits that create avoidable churn.
