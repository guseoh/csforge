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

### Reading depth and paragraph rhythm

The main Concept body should make the current learning objective understandable without turning every page into a
reference manual. Start from a concrete problem, code state, request flow, data state, or familiar observation when that
makes the idea easier to enter. Introduce the precise technical term after the learner has a usable mental model.

Do not put several independent claims into one large paragraph. Split naturally when the cause, state transition,
comparison target, or conclusion changes. Two to four connected sentences is often a useful paragraph size, but this is
a readability heuristic rather than a quota. The opposite extreme is also undesirable: do not replace explanation with
a stack of one-line memo fragments.

Keep the core explanation on the page. Material that is useful but not required to understand the current objective—such
as implementation internals, production case studies, adjacent theory, or version-specific detail—should normally be
linked through verified References instead of being forced into the main prose. Prefer Korean IT-company engineering
articles when they directly improve understanding, while keeping official specifications/documentation as the source of
truth for technical guarantees.

### Visualization contract

The Curriculum `visualization` value is an authoring decision that must be reflected in the actual Concept, not metadata
that is ignored after planning.

- `NONE`: prose and code are enough; do not add a decorative diagram.
- `TEXT`: use an ASCII diagram, timeline, state table, request flow, or another text-first visualization when it makes the
  relationship or execution order easier to see.
- `DIAGRAM`: when prose alone is likely to create a wrong mental model, provide a deliberate diagram/image or another
  equally effective visualization. Prefer repository-owned assets; do not hotlink third-party images without a clear
  license and stability reason.

Good candidates include reference/value flow, HashMap lookup, JVM data areas, GC reachability, process/thread relations,
virtual memory, race interleaving, happens-before/CAS, TCP state/flow, B-tree/index traversal, MVCC/locking, and distributed
coordination. This list is illustrative, not a requirement to draw every listed topic.

### Interview recall convention

A Concept may include a small recall section when the topic is commonly discussed in backend interviews and the questions
help the learner retrieve the underlying model. The Concept must still be a learning article first, not an interview-answer
collection.

Use this safe Markdown convention:

```markdown
### 면접에서 이렇게 나옵니다

#### Q. Java는 객체를 pass-by-reference로 전달하나요?

아닙니다. Java의 인자 전달은 항상 pass-by-value입니다.

참조형에서는 **참조 값 자체가 복사**되므로 호출자와 메서드의 변수가 같은 객체를 가리킬 수 있습니다.
재대입과 객체 상태 변경을 구분해서 설명하는 것이 핵심입니다.
```

Rules:

- normally use one to three representative questions, only when they have real recall value;
- every interview question heading must start with `#### Q. `;
- the answer is rendered collapsed by default so the learner can attempt retrieval before opening it;
- start with a concise core answer, then add the reason, important boundary, common mistake, or follow-up point only when
  useful;
- do not duplicate the Concept body verbatim and do not add interview questions merely to fill a template;
- do not embed raw HTML such as `<details>` in canonical content. The frontend owns the disclosure interaction.

## Question authoring quality

Questions test the Concept instead of repeating its title or summary. A `SHORT_ANSWER` accepted answer must contain the
actual proposition, value, API decision, or state result being assessed; the Concept title alone must never be accepted.
`MULTIPLE_CHOICE` distractors should be plausible misconceptions from the same topic. A `HARD` label requires real
reasoning such as code execution, a transaction timeline, an HTTP exchange, a production symptom, or a design trade-off;
adding the word “운영” to a definition question does not make it hard.

Do not force every Concept into the same EASY/MEDIUM/HARD and question-type pattern. Coverage is evaluated across the
Topic and LearningArea, while each Concept gets the number and forms of questions that actually improve learning.

### Question readability

`promptMarkdown`, choice content, model answers, and explanations are Markdown learning content. Format them for the
learner rather than storing everything as one compact sentence.

- If code, SQL, HTTP, configuration, or a timeline spans multiple logical lines, use a fenced code block rather than a
  long inline-code fragment.
- Separate scenario/setup from the final question when that distinction reduces rereading.
- Use a table or ASCII timeline when the learner must compare states, order, locks, requests, threads, or transactions.
- Keep inline code for identifiers and genuinely short expressions.
- Choice text may use Markdown when code or structure is part of the choice; keep distractors comparable in visual detail
  so formatting does not reveal the answer.

### Explanation quality

`explanationMarkdown` is a second learning opportunity, not a one-line restatement of the correct answer. It should be as
short as the problem allows, but sufficiently explain the reasoning that distinguishes understanding from guessing.

When relevant, include:

- why the correct answer follows from the core contract or state transition;
- the decisive condition or execution step;
- why a plausible misconception/distractor is wrong;
- a boundary where the rule changes or where implementation detail must not be mistaken for a guarantee;
- a reason to revisit one of the linked Concepts.

Do not mechanically explain every option when only one misconception is meaningful. For descriptive/scenario questions,
the model answer should demonstrate the expected reasoning path rather than act as a memorized script.

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
