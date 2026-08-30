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

## 7. Engineering rule: implementation quality and modern stack guardrails
Code should look like maintainable production Java/Spring code written by a competent team, not like the shortest possible generated implementation. Optimize for clarity, cohesion, changeability, and explicit domain intent.

### Persistence
- JPA/Hibernate and Spring Data JPA are the default persistence APIs for canonical application data.
- Do not introduce raw JDBC, `JdbcTemplate`, `NamedParameterJdbcTemplate`, direct `Connection`/`PreparedStatement`, manual `ResultSet`/`RowMapper`, MyBatis, or another parallel persistence stack unless the current task has a concrete requirement that JPA cannot reasonably satisfy and the user explicitly approves the exception.
- Native SQL through JPA is allowed only for a clearly justified PostgreSQL-specific or query-specific need. It must not become the default CRUD or read-model implementation style.
- Prefer entity relationships, Spring Data repositories, JPQL, projections, Specifications/Criteria, or another maintained JPA-compatible approach that matches the query.
- Do not bypass JPA merely because a large handwritten SQL query is faster for the agent to produce.

### Java structure and readability
- Do not concentrate unrelated query, mapping, validation, state transition, and DTO responsibilities into one oversized class.
- Avoid long methods with repeated `if`/`else` branches when the conditions represent distinct policies or responsibilities. Prefer early returns, small named methods, enums/strategies, specifications, or query composition when they make the intent clearer. Do not introduce a pattern only to eliminate a harmless simple conditional.
- Do not use `if` chains as a substitute for polymorphism or explicit domain rules when behavior will grow by type/state.
- Keep controller, application/service, domain, and persistence responsibilities distinguishable. Do not force layers that add no value, but do not collapse everything into one repository/helper class either.
- Prefer domain behavior on entities/value objects when it protects state invariants; avoid anemic setter-driven state mutation.
- Do not expose JPA entities directly from API controllers.

### Practical object-oriented design
- Prefer high cohesion and low coupling. A class should have one clear reason to change and should not become a miscellaneous container for unrelated behavior.
- Encapsulate state changes behind intention-revealing methods such as `complete()`, `markReviewNeeded()`, `bookmark()`, or `recordView()` rather than exposing blanket setters.
- Protect domain invariants where the state lives. If an object can prevent an invalid transition itself, do not scatter the same validation across controllers and services.
- Prefer telling an object to perform domain behavior over repeatedly extracting its state and making decisions elsewhere when that behavior naturally belongs to the object.
- Prefer composition over inheritance. Use inheritance only when there is a real stable is-a relationship and polymorphic behavior benefits from it.
- Depend on abstractions at meaningful boundaries, but do not create an interface for every class. Introduce an interface when there are multiple implementations, an external boundary, a testing seam with real value, or a likely architectural substitution point.
- Prefer immutable values where practical. Use `record` for DTOs/value carriers that are genuinely data-oriented, not as a substitute for domain objects that own behavior and invariants.
- Use enums for closed domain concepts and place behavior on the enum when that removes duplicated type/state branching cleanly.
- Avoid primitive obsession when a value has validation, units, formatting, or domain meaning strong enough to justify a value object. Do not create value objects for trivial values with no behavior or invariant.
- Keep nullability explicit. Prefer required constructor arguments and empty collections over nullable collections. Use `Optional` mainly at return boundaries where absence is meaningful, not as entity fields, DTO fields by default, or method parameters.
- Prefer constructor injection and `final` dependencies. Avoid field injection.
- Keep visibility as narrow as practical. Do not make types/methods public solely for convenience if package-private or private better expresses the boundary.
- Avoid static mutable state and utility classes that accumulate domain logic. Stateless technical helpers are fine when they are genuinely cross-cutting and cohesive.

### Design pattern usage
- Apply SOLID and common design patterns as problem-solving tools, not as ceremony.
- Before adding Strategy, Factory, Template Method, Chain of Responsibility, Adapter, Facade, Specification, State, or another pattern, identify the concrete variation, boundary, or complexity it addresses.
- Use Strategy/polymorphism when behavior meaningfully varies by type or policy and branching would otherwise keep growing.
- Use Factory/factory methods when object creation has invariants, meaningful defaults, or construction policy; do not hide trivial constructors behind factories without benefit.
- Use Specification or query composition when optional filtering rules need to compose cleanly; do not build a generic specification framework for one fixed query.
- Use Adapter at external-system/library boundaries when it protects the application from vendor/API details.
- Use Facade/application service to coordinate a use case, but keep domain rules out of a procedural god service when those rules belong to domain objects.
- Use State only when state-dependent behavior is substantial enough to justify it; a small enum plus explicit methods is preferable for simple state transitions.
- Do not force GoF patterns, DDD tactical patterns, or hexagonal/clean architecture structures into simple code merely to appear sophisticated.

### Service and domain behavior
- Controllers translate HTTP concerns and delegate use cases; they should not contain business rules, persistence logic, or transaction choreography.
- Application services coordinate a use case and transaction boundary. They may orchestrate repositories and domain objects, but should not become a dumping ground for every validation and branch.
- Domain entities/value objects own state-specific rules and transitions when those rules are intrinsic to the domain.
- Repository code owns persistence concerns, not HTTP response shaping or domain workflow decisions.
- Read-only screen projections may use dedicated query components when needed, but keep them separate from write-side domain behavior and remain within the approved JPA stack.
- Avoid pass-through methods/classes that only forward arguments without adding a boundary, policy, transaction, or meaningful abstraction.

### Naming and method design
- Name classes and methods after domain/use-case intent rather than implementation mechanics. Prefer `completeConcept` or `recordConceptView` over generic names such as `process`, `handle`, `executeTask`, or `updateData`.
- Keep methods focused. Extract a method when it gives a meaningful name to a rule or reduces mixed abstraction levels; do not split straightforward code into tiny methods that make the flow harder to follow.
- Avoid boolean flag parameters that switch a method between unrelated behaviors. Prefer separate intention-revealing methods or a domain type when the distinction matters.
- Avoid unexplained magic numbers/strings when they represent domain policy. Use named constants, enums, or configuration at the appropriate boundary.
- Comments should explain why, trade-offs, or non-obvious constraints. Do not add comments that merely restate readable code.

### DTO and type naming
- DTOs must have names that communicate their role and direction. Prefer names such as `ConceptDetailResponse`, `ConceptListItemResponse`, `ConceptProgressUpdateRequest`, `PersonalNoteResponse`, `LearningAreaSummaryResponse` over generic containers such as `LearningDtos`, `Data`, `Result`, `Info`, or `Dto` buckets.
- Do not place many unrelated request/response/projection records inside one large DTO utility class merely to reduce file count.
- Small private helper records/classes may be nested only when they are truly implementation details of the enclosing type and are not reused across boundaries.
- Public API request/response types and reusable application projections should normally be top-level named types in the appropriate package.
- Avoid boolean parameters or fields whose meaning is unclear at the call site; prefer meaningful names/enums when the distinction is domain-significant.

### Query/read model quality
- Avoid manual column-by-column `ResultSet` mapping for normal application reads.
- Prevent N+1 through deliberate JPA query design: fetch joins, entity graphs, projections, batch fetching, or explicit secondary queries chosen for the actual use case.
- Do not solve N+1 by replacing the whole read path with JDBC.
- Keep list queries paginated and stably ordered.
- For complex screen-oriented reads, a dedicated JPA projection/query repository is acceptable; it should still have a clear responsibility and not become a catch-all SQL class.

### Current technology usage
- Use modern Java features supported by the approved Java version when they improve clarity, but do not chase novelty for its own sake.
- Do not introduce deprecated APIs, end-of-life libraries, old framework idioms, or superseded Spring configuration styles when the selected stack provides a supported replacement.
- Do not downgrade or replace an approved technology with an older alternative simply because it is easier for the agent to generate.
- Before adding a new framework/library, inspect the existing project stack and use a current maintained option compatible with it.
- When a legacy/low-level API is genuinely required for a specific capability, keep its use narrow and document the concrete reason in the change.

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
6. Review the changed code as production Java/Spring code: check persistence-stack compliance, object-oriented responsibility placement, domain invariants, class/method cohesion, DTO/type naming, unnecessary nested public types, repeated branching, misuse or needless use of design patterns, and responsibility leakage.
7. Run the smallest meaningful validation first, then the broader project validation appropriate to the change.
8. Report changed behavior, validation results, and any remaining limitation briefly.
9. Do not commit, push, open a PR, or modify unrelated files unless the task explicitly asks for it.

Prefer one complete vertical change over repeated tiny edits that create avoidable churn.
