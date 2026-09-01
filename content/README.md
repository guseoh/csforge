# CSForge content

`examples/` contains a small representative import batch. Markdown uses YAML front matter;
JSON accepts one object or an array of objects. `references` on a Concept is an explicit
complete set when present, so omitted links are preserved and declared omissions are removed.

## Canonical area layout

Canonical LearningArea content uses a topic-oriented layout.

```text
content/{area}/
├─ topics.json
└─ {topic-slug}/
   ├─ {concept-slug}.md
   └─ questions.json
```

Curriculum foundations are stored under `content/curriculum/` and define the approved Topic,
Concept, level, learning objective, density, and optional prerequisite/visualization contract.

## Concept authoring quality

Canonical Concept content is product data, not a glossary or a collection of interview-note fragments.
A Concept should be detailed enough that a learner can explain why the concept exists, how it works,
what state changes while it runs, where it fails, how it differs from adjacent choices, and how a backend
engineer should make a practical decision with it.

The body starts with one `#` Concept title. Major sections inside a Concept normally use `###` and nested
sections use `####`; `##` is intentionally avoided in Concept bodies so the page hierarchy remains visually
compact. Section names are chosen for the subject instead of forcing every Concept into an identical template.

Use connected Korean explanatory paragraphs. Short lists and tables are useful when they expose a real comparison,
state transition, execution order, or decision boundary, but they must not replace the explanation. Avoid generated
phrases such as “이 개념은 이름보다 책임을 먼저 봐야 한다”, placeholder particles such as `은(는)`, and repeated
meta sentences that merely tell the learner to trace a flow without actually showing the flow.

When useful, include concrete Java, SQL, HTTP, configuration, transaction timelines, or ASCII diagrams. Explain the
example immediately after showing it: what changed, which layer owns the behavior, what can fail, and which guarantee
comes from the language/framework/database/browser rather than from application code.

Concepts should normally cover the following ideas when they are relevant, without turning them into mandatory headings:

- the problem that creates the need for the concept
- the core contract or mental model
- internal execution/state flow
- concrete code, SQL, HTTP, configuration, or timeline example
- comparison and trade-off with adjacent alternatives
- common misconception or failure mode
- backend/project decision point
- deeper connection or verified reference

References should point to the most specific verified primary source available. Do not use a documentation root page
when a stable page for the exact contract exists. Implementation-dependent behavior must not be presented as a language,
framework, database, browser, JVM, OS, or protocol guarantee.

## Question authoring quality

Questions test the Concept instead of repeating its title or summary. A `SHORT_ANSWER` accepted answer must contain the
actual proposition, value, API decision, or state result being assessed; the Concept title alone must never be accepted.
`MULTIPLE_CHOICE` distractors should be plausible misconceptions from the same topic. A `HARD` label requires real
reasoning such as code execution, a transaction timeline, an HTTP exchange, a production symptom, or a design trade-off;
adding the word “운영” to a definition question does not make it hard.

Do not force every Concept into the same EASY/MEDIUM/HARD and question-type pattern. Coverage is evaluated across the
Topic and LearningArea, while each Concept gets the number and forms of questions that actually improve learning.

### Curriculum question coverage contract

Question counts are outputs of the learning design, not quotas. In particular, Wave curriculum entries that still contain
legacy `everyConcept.minimumByDifficulty` or `minimumTotal` fields must not be interpreted as a requirement to create
exactly one EASY, one MEDIUM, and one HARD question for every Concept. The canonical authoring rule is Topic/LearningArea
coverage: choose the number, difficulty, and type of questions that best test each learning objective, then review the Topic
and LearningArea as a whole for balanced coverage.

A Concept may have fewer or more than three questions when that improves learning. `SHORT_ANSWER` is appropriate when a
compact value, term, or deterministic result can be graded reliably; causal explanations belong in `DESCRIPTIVE` or
`SCENARIO`. `HARD` questions must require real multi-step state, constraint, cost, or failure reasoning rather than a
longer restatement of the definition.
