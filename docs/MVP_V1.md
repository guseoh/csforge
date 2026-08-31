# CSForge MVP V1

## 1. Product definition
CSForge is a local-first personal learning system for CS and backend development knowledge. The main loop is:

`Dashboard -> Learning Areas -> Concept -> Quiz -> Result -> Wrong Notes -> Review -> Search`

Content grows through:

`Markdown/JSON -> Validation -> Preview/Diff -> Import -> PostgreSQL -> Search indexing`

V1 is single-user, no-auth, local-only, and has no cross-device sync.

## 2. Learning areas
V1 has 15 independent areas, each with Level 1-3 concepts:

1. Computer Architecture
2. Data Structures & Algorithms
3. Operating Systems
4. Network & HTTP
5. Database
6. Java
7. Spring
8. Backend Engineering
9. Cache
10. Messaging & Async Processing
11. Infrastructure & Cloud
12. Performance / Observability / Operations
13. Distributed Systems
14. System Design
15. Security

Question difficulty is independent from concept level.

## 3. Main screens

### Dashboard `/`
Purpose: show current learning status and the next useful action.

Include:
- today solved count
- today accuracy
- today review due count
- study streak
- learning heatmap
- progress by area and level
- weak topics
- recent quizzes
- active/in-progress quiz resume CTA
- quick review CTA

API baseline:
- `GET /api/dashboard`

### Learning Areas `/learning`
Show all 15 areas with:
- concept count
- learned count
- question count
- accuracy
- L1/L2/L3 progress

APIs:
- `GET /api/learning-areas`
- `GET /api/learning-areas/{areaSlug}`

### Area detail `/learning/{areaSlug}`
Show Topic -> Concept hierarchy with level filters and progress states.

Concept progress states:
- `UNSEEN`
- `LEARNING`
- `COMPLETED`
- `REVIEW_NEEDED`

### Concept detail `/concepts/{conceptId}`
Include:
- breadcrumb
- title / level / topic
- connected core explanation rather than glossary fragments
- diagrams/images when useful
- examples/tables that are explained in prose
- common misunderstandings and failure boundaries
- deeper section
- references
- personal note with autosave
- related concepts
- previous/next concept
- bookmark
- explicit `learned` action
- related-question CTA

Canonical concept content and personal notes remain separate.

### Quiz setup `/quiz`
Filters:
- one or more areas
- one or more levels
- question states: all / unseen / wrong / review-needed
- question types
- question count: 5 / 10 / 20 / 30 / custom
- optional time limit

Convenience:
- presets such as today's 10, recent wrong answers, mixed, last settings
- remember last settings
- stable filtered results

### Quiz session `/quiz/{quizId}`
Include:
- current / total
- optional timer
- level/difficulty/area chips
- answer input
- review-needed toggle
- previous/next
- direct question navigation
- keyboard shortcuts
- answer autosave
- resume after app restart

Default policy: do not reveal correctness until quiz submission.

### Result `/quiz/{quizId}/result`
Include:
- total / correct / wrong / accuracy
- per-area/topic result
- problem-level result list
- expandable wrong-answer detail
- wrong-only retry
- related-concept navigation
- add-to-review action

APIs:
- `POST /api/quizzes`
- `POST /api/quizzes/{quizId}/submit`
- `GET /api/quizzes/{quizId}/result`

### Wrong Notes `/wrong-notes`
Wrong notes are grouped by Question, not Attempt.

List filters/sorts should include useful combinations of:
- area/topic/level/difficulty
- recent wrong
- wrong count
- review due
- AI-analysis status
- mastery status

Wrong detail includes:
- question
- recent answer
- correct answer/model answer
- explanation
- personal `why I was wrong` note
- AI analysis
- related concepts
- attempt history
- retry CTA

### Review `/review`
Show:
- due today
- overdue
- tomorrow
- this week
- quick starts such as overdue-first and limited-count sessions

Baseline schedule:
- wrong -> +1 day
- correct -> +3 days
- correct -> +7 days
- correct -> +14 days
- then mastered
- a wrong review returns to stage 1

A correct question explicitly marked `review needed` also enters the review queue.

### Search `/search`
Search across:
- Concept
- Question
- Personal Note
- Wrong Note
- Reference

V1 search features:
- Korean Nori analysis
- BM25/full text
- field boosts
- highlight
- type/area/level/topic filters
- sorting
- autocomplete
- recent search terms
- fuzzy/typo tolerance where appropriate
- stable paging; use Elasticsearch `search_after` for deep paging where useful

Global convenience:
- `Ctrl/Cmd + K` command/search palette

### Content Import `/settings/import`
Support:
- Markdown
- JSON
- drag & drop
- multi-file import
- folder-oriented bulk workflows where practical

Flow:
`Select -> Parse -> Validate -> Preview/Diff -> Confirm -> Import -> Progress -> Result`

Requirements:
- stable `content_key`
- idempotent re-import
- created/updated/unchanged/skipped/failed summary
- item-level validation errors
- meaningful diff before overwrite/update
- bulk-safe implementation

## 4. Core data model
Baseline entities/tables:

- `learning_area`
- `topic`
- `concept`
- `concept_progress`
- `reference`
- `concept_reference`
- `personal_note`
- `question`
- `question_choice`
- `question_answer`
- `question_concept`
- `quiz_session`
- `quiz_question`
- `attempt`
- `wrong_note`
- `review_schedule`
- `review_history`
- `ai_analysis`
- `outbox_event`

### Important relations
- `LearningArea 1:N Topic`
- `Topic 1:N Concept`
- `Concept M:N Question`
- `Concept M:N Reference`
- `Concept 1:N PersonalNote` (concept may be nullable later for general notes)
- `QuizSession 1:N QuizQuestion`
- `QuizSession 1:N Attempt`
- `Question 1:1 WrongNote` at most one current aggregate wrong note
- `Question 1:1 ReviewSchedule` at most one current schedule
- historical Attempts and ReviewHistory are retained

## 5. Question rules
Question types:
- `MULTIPLE_CHOICE`
- `SHORT_ANSWER`
- `DESCRIPTIVE`
- `SCENARIO`

Question difficulty:
- `EASY`
- `MEDIUM`
- `HARD`

V1 grading:
- multiple choice: automatic
- short answer: accepted-answer rules
- descriptive/scenario: show model answer/explanation and let the user self-check unless a later task explicitly adds AI grading

A Question should reference at least one Concept.

## 6. Pagination, indexes, and query quality
Do not defer these intentionally.

All list APIs that can grow should have:
- pagination
- useful filters
- sorting
- stable ordering
- bounded page size

Use offset pagination where the UI benefits from page numbers and data volume is moderate. Prefer keyset/cursor pagination for append-heavy histories such as Attempts/ReviewHistory/activity feeds when it improves stability or deep navigation.

Initial migrations must include indexes for known access paths, including at minimum concepts by topic/level/status, questions by level/difficulty/type/status, question-concept reverse lookup, quiz history, attempts by quiz/question/time, wrong notes by status/recent wrong, review schedules by status/due time, personal notes by concept/update time, and outbox publication scans.

Indexes are refined later by query-plan measurement, not intentionally omitted until a problem is reproduced.

## 7. Async and source-of-truth rules
PostgreSQL is canonical.

Use Kafka for workflows where asynchronous processing has product value, including:
- search indexing
- AI wrong-answer analysis
- analytics/event processing

Use a transactional outbox where DB state and event publication must remain consistent. Do not make synchronous CRUD depend on Kafka unnecessarily.

Elasticsearch stores search projections only and must support reindexing from canonical data.

Redis is optional/derived infrastructure for cache or temporary state; core learning flows should not require Redis as their only source of truth.

## 8. AI V1
Core AI capability:
- on-demand wrong-answer analysis

Input may include:
- question
- options/model answer
- user's answer
- canonical explanation
- related concept context

Structured output:
- why wrong
- missed concepts
- correct understanding in a concise form
- related concept links/keys
- 1-2 follow-up questions

AI status:
- `PENDING`
- `PROCESSING`
- `COMPLETED`
- `FAILED`

AI does not overwrite canonical concept/question content automatically.

Question generation can create drafts, but user review is required before canonical publication.

## 9. Convenience quality
V1 should be pleasant enough for daily use. Where relevant, implement:
- global command/search palette
- bookmarks
- recent concepts
- quiz resume
- answer autosave
- note autosave with save-state feedback
- remembered filters/settings
- URL-preserved filters where useful
- skeleton/loading states
- clear empty/error states
- retry actions
- toast feedback
- keyboard shortcuts
- dark UI and responsive layout
- accessible interactive controls

Do not add convenience features that duplicate each other or create maintenance burden without improving the daily study loop.

## 10. Explicitly out of V1
Unless a later approved task changes scope:
- signup/login/auth/member domain
- multi-user sharing/social/group/ranking
- cloud deployment
- cross-device synchronization
- Kubernetes
- real-time notifications/WebSocket as a requirement
- FSRS/adaptive scheduling
- automatic canonical AI content publishing
- mandatory AI grading for descriptive answers

Semantic/vector search, ClickHouse analytics, OpenTelemetry/Loki/Tempo, and other advanced capabilities are not forbidden by an artificial 'wait for performance problems' rule. They should be added when a concrete approved product or observability responsibility is implemented, rather than as empty infrastructure.

## 11. V1 completion flow
V1 is functionally complete when this loop works end-to-end:

1. Import Concept/Question content.
2. Read a Concept and save a personal note.
3. Start and resume a quiz with useful filters/presets.
4. Submit and inspect results.
5. Wrong answers update Wrong Notes and review scheduling.
6. Request and receive an AI wrong-answer analysis.
7. Complete due reviews and advance/reset the schedule correctly.
8. Dashboard progress/weakness/activity updates.
9. Search finds canonical content and personal learning history.
