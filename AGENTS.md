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
- Lombok
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

Start with one Spring Boot application. Keep feature/module boundaries clear enough to split runtime responsibilities later, but do not create separate API/worker applications or duplicate Gradle projects without an actual need.

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
- duplicated DTO/domain models without a real boundary that requires them
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
- Prefer entity relationships, Spring Data repositories, JPQL, projections, fetch joins, entity graphs, Specifications/Criteria, or another maintained JPA-compatible approach that matches the query.
- Do not bypass JPA merely because a handwritten SQL query is faster for the agent to produce.
- Do not solve N+1 by replacing the read path with JDBC. Design the JPA query deliberately.
- Repository/query code owns persistence and query concerns only. It must not become a catch-all for HTTP response shaping, business validation, state transition rules, DTO assembly, and unrelated helpers.
- Query loaders must load what the current use case needs. Do not create a generic `loadEverything()` path that fetches answers, references, concepts, history, and other data for commands that only need one entity/count.
- Avoid both N+1 and unnecessary over-fetching. Query count is not the only performance concern.

### Object-oriented design
- Apply encapsulation, abstraction, polymorphism, cohesion, and dependency direction as practical design tools.
- Prefer high cohesion and low coupling. A class should have a clear responsibility and a small set of related reasons to change.
- Protect domain invariants where the state lives. If an entity/value object can prevent an invalid transition itself, do not scatter the same rule across controllers and services.
- Prefer intention-revealing behavior such as `complete()`, `publish()`, `markReviewNeeded()`, `bookmark()`, `recordView()`, or `submit()` over blanket setters and generic multi-flag update methods.
- Prefer telling an object to perform behavior over repeatedly reading its state and deciding everything in a procedural service when the behavior naturally belongs to the object.
- Prefer explicit state-transition methods for meaningful lifecycle changes. Do not create an object in a logically published/completed state first and rely only on a persistence callback to discover later that required invariants are missing.
- Persistence callbacks may remain as a defensive backstop, but they must not be the only expression of an important domain transition.
- Prefer composition over inheritance. Use inheritance only for a stable is-a relationship with meaningful polymorphic behavior.
- Depend on abstractions at meaningful boundaries, but do not create interfaces for every class. Add an interface for a real external boundary, multiple implementations, substitution point, or architecture-worthy test seam.
- Prefer immutable values where practical. Use `record` for request/response/value carriers that are genuinely data-oriented, not as a substitute for behavioral domain objects.
- Use enums for closed domain concepts. Put behavior on an enum when it cleanly removes duplicated policy/type branching.
- Avoid primitive obsession when a value has validation, units, formatting, or domain meaning strong enough to justify a value object. Do not create value objects for trivial values with no behavior or invariant.
- Keep nullability explicit. Prefer required constructor arguments and empty collections over nullable collections. Use `Optional` mainly for meaningful return boundaries, not entity fields or method parameters by default.
- Prefer constructor injection and `final` dependencies. Avoid field injection and static mutable state.
- Keep visibility as narrow as practical. Do not make types or methods public solely for convenience.

### Layer and dependency direction
Each layer must keep its own responsibility. The existence of packages is not enough; dependencies and behavior placement must follow the boundary.

Preferred dependency direction for a feature:

`api -> application -> domain`

Infrastructure/repository implementations may depend on domain/application contracts as needed, but domain and application code must not depend on HTTP/API presentation types.

Rules:
- **API/Controller layer** owns HTTP concerns: request parsing, Bean Validation, status codes, response contracts, and delegation.
- Controllers must not contain persistence logic, transaction orchestration, grading/business policy, or domain state transitions.
- API Request/Response records belong to the API boundary. Application services must not import or return `*Request` / `*Response` API types.
- Translate API DTOs into application command/query inputs at the API boundary. Translate application results/views into API responses at the API boundary.
- **Application layer** owns use-case orchestration and transaction boundaries. It coordinates repositories, domain objects, policies, and query components.
- Application services should return application result/view models when a boundary result is needed instead of leaking API DTOs or JPA entities directly to controllers.
- **Domain layer** owns intrinsic invariants, state-specific behavior, and lifecycle transitions.
- **Repository/Infrastructure layer** owns persistence/query mechanics only. It must not own HTTP contracts or core business rules.
- **Mapper/Assembler layer** is a transformation boundary only. A mapper may reshape prepared application/domain data into an API response, but it must not validate use-case state, decide grading policy, calculate business statistics, or obtain the current time to make domain decisions.
- Do not build business statistics by first creating API Response objects and then reading those Response objects back. Calculate statistics from domain/application data and map the finalized result afterward.
- Cross-cutting HTTP error translation belongs in an appropriate `global.api` boundary when it spans multiple features. Do not grow a `LearningExceptionHandler` into a handler for Quiz/Review/Search merely because it already exists.
- `@Transactional` belongs at the application/use-case boundary unless there is a concrete reason otherwise. Keep controllers transaction-free.
- Use Bean Validation for request-shape constraints and domain methods for domain invariants. Do not repeatedly hand-code the same null/range validation across layers when a maintained mechanism fits.
- When time is part of domain policy and deterministic testing matters, use an injected `Clock`. Keep `Clock` in the application/domain policy path that needs time; do not inject it into a response mapper merely to compute a business state.

### Lombok usage
Use Lombok to remove mechanical boilerplate when it makes the code easier to read, while keeping domain behavior explicit.

Preferred uses:
- `@RequiredArgsConstructor` for Spring components/services/controllers with final constructor-injected dependencies.
- `@Getter` for entities/value holders when straightforward getters are appropriate.
- `@Slf4j` for classes that genuinely log.

Restrictions:
- Do not use `@Data` on JPA entities.
- Do not apply generated `equals/hashCode/toString` blindly to JPA entities or lazy associations.
- Do not use `@Setter` as a replacement for intention-revealing domain behavior.
- Do not add `@Builder` to every DTO/entity mechanically. Use it only when construction complexity actually benefits.
- Lombok must reduce boilerplate, not hide invariants or lifecycle rules.

### Class documentation
- Every production Java **class** must have a short class-level Javadoc immediately above the class annotations/declaration explaining its purpose.
- Keep this intentionally brief, usually one Korean sentence such as `퀴즈 세션의 상태 변경 유스케이스를 처리하는 애플리케이션 서비스이다.`
- Do not write long tutorial comments or repeat implementation details.
- Do not add Javadoc to every method mechanically. Method comments are for non-obvious contracts, reasons, or trade-offs.
- Public records/interfaces/enums may also have short type-level Javadoc when their role is not already self-evident or when the type is an important reusable contract.

### Branching, methods, and complexity
- Simple `if` statements are fine. Do not eliminate harmless conditionals only to satisfy a style rule.
- Repeated or growing `if/else` or `switch` branches that encode policies, types, or state-dependent behavior should trigger a design review. Consider polymorphism, enum behavior, Strategy, State, Specification, or smaller intention-revealing methods when they actually improve the design.
- Avoid boolean flag parameters that switch a method between unrelated behaviors. Prefer separate intention-revealing methods or a domain type when the distinction matters.
- Keep methods at a consistent abstraction level. Extract methods when they name a real rule or remove mixed responsibilities, not merely to reduce line count.
- Do not create oversized god classes that combine query loading, validation, orchestration, result calculation, DTO construction, and domain behavior.
- Large classes/methods are not automatically forbidden, but before finalizing them confirm that their size comes from one cohesive responsibility rather than accumulated unrelated responsibilities.
- Avoid unexplained magic numbers/strings when they represent domain policy. Use named constants, enums, validated request types, or configuration at the appropriate boundary.

### DTO and type design
- Public API DTOs must have names that communicate role and direction. Prefer `ConceptDetailResponse`, `ConceptListItemResponse`, `ConceptProgressUpdateRequest`, `PersonalNoteResponse`, `LearningAreaSummaryResponse` over generic names such as `LearningDtos`, `Data`, `Result`, `Info`, or bucket classes.
- Do not place many unrelated public request/response/projection records inside one large DTO utility class merely to reduce file count.
- Public API request/response types and reusable application command/result/view types should normally be top-level named types in the appropriate package.
- Small private helper records/classes may be nested only when they are truly implementation details of the enclosing type and are not shared across boundaries.
- Persistence projections, application results, and API responses are different roles. Keep them separate when a real layer boundary requires it; do not merge them solely to save mapping code if that reverses dependency direction.
- Do not expose JPA entities directly from controllers.

### Design pattern usage
- Apply SOLID and common patterns as problem-solving tools, not ceremony.
- Before adding Strategy, Factory, Template Method, Chain of Responsibility, Adapter, Facade, Specification, State, or another pattern, identify the concrete variation, boundary, or complexity it addresses.
- Use Strategy/polymorphism when behavior meaningfully varies by policy/type and branching would otherwise keep growing.
- Use factory methods when object creation has invariants, meaningful defaults, or construction policy. Do not hide trivial constructors behind factories without benefit.
- Use Specification/query composition when optional filtering rules need to compose cleanly. Do not build a generic specification framework for one fixed query.
- Use Adapter at external-system/library boundaries when it protects the application from vendor/API details.
- Use State only when state-dependent behavior is substantial enough to justify it; a small enum plus explicit methods is preferable for simple transitions.
- Do not force GoF patterns, DDD tactical patterns, hexagonal architecture, clean architecture, CQRS, or ports/adapters into simple code merely to appear sophisticated.

### Naming and readability
- Name classes and methods after domain/use-case intent rather than implementation mechanics. Prefer `recordConceptView`, `completeConcept`, `submitQuiz`, or `saveAnswer` over `process`, `handle`, `executeTask`, or `updateData`.
- Comments should explain why, a trade-off, or a non-obvious constraint. Do not add comments that merely restate readable code, except for the intentionally brief class-purpose Javadoc required above.
- Prefer straightforward production code over clever code. A future Java/Spring developer should understand the intent without reverse-engineering agent shortcuts.

### Existing-code migration rule
- Existing code that predates these rules is technical debt, not precedent.
- Do not copy, expand, or use an existing low-level JDBC path, DTO bucket, oversized helper, layer violation, or similar deviation as justification for new code.
- When a future task directly touches such code, improve the touched portion toward these rules when that can be done safely within task scope.
- Do not launch a broad unrelated refactor solely to make old code conform. Create an explicit refactor task when the change would materially expand scope or risk.

### Current technology usage
- Use modern Java features supported by the approved Java version when they improve clarity, but do not chase novelty for its own sake.
- Do not introduce deprecated APIs, end-of-life libraries, old framework idioms, or superseded Spring configuration styles when the selected stack provides a supported replacement.
- Do not downgrade or replace an approved technology with an older alternative because it is easier for the agent to generate.
- Before adding a new framework/library, inspect the existing stack and use a current maintained option compatible with it.
- When a legacy or low-level API is genuinely required for a specific capability, keep its use narrow and document the concrete reason in the change.

## 8. Engineering rule: formatting without ritual work
Code style must remain consistent, but formatting must not become token-heavy ceremony.

For every task that changes code:
- changed files must follow the repository formatter/style;
- if formatting is already automatic or integrated into an existing validation command, do not run a duplicate format-check merely for ceremony;
- small changes do not require a whole-repository formatting pass;
- run a dedicated formatter/format-check only when formatter configuration changed, formatting is uncertain, or repository validation already includes it;
- never mass-reformat unrelated files;
- final lint/type-check/test/build should reflect the actual final files.

## 9. Core V1 domain rules
- Learning structure: `LearningArea -> Topic -> Concept`.
- Concept levels are `1`, `2`, `3`.
- Question difficulty is separate from Concept level.
- A Question should be connected to at least one Concept before publication.
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
6. Review changed Java/Spring code as production code before validation: persistence-stack compliance, layer dependency direction, object responsibility, domain invariants, transaction boundaries, validation placement, class/method cohesion, DTO/type naming, Lombok safety, class-purpose Javadoc, unnecessary nested public types, repeated policy branching, over-fetching/N+1, and design-pattern misuse or overuse.
7. Explicitly check that application code does not import API request/response types and that response mappers do not own business validation/statistics/policy.
8. If an existing implementation violates these rules, do not silently copy the pattern. Either improve the touched portion within scope or report why a separate refactor is safer.
9. Run the smallest meaningful validation first, then the broader project validation appropriate to the change.
10. Report changed behavior, validation results, and any remaining limitation briefly.
11. Do not commit, push, open a PR, or modify unrelated files unless the task explicitly asks for it.

Prefer one complete vertical change over repeated tiny edits that create avoidable churn.
