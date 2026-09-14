# CSForge Design Contract

## 1. Purpose

This file is the product-owned UI/UX contract for CSForge.

Use it for frontend work that changes layout, visual hierarchy, navigation, interaction states, responsive behavior, visual tokens, or user-facing copy. It does not replace `AGENTS.md`, `docs/MVP_V1.md`, `content/AGENTS.md`, an approved Issue/PR contract, or an explicit user decision.

When sources conflict, follow this order:

1. the user's current explicit decision;
2. the current approved Issue/PR contract;
3. `AGENTS.md`;
4. `docs/MVP_V1.md`;
5. `content/AGENTS.md` for canonical learning-content authoring rules;
6. this file;
7. existing implementation details and external references.

Existing frontend code is an implementation input, not a visual source of truth. A legacy layout, token, card shape, CSS override, or screen composition may be replaced when it conflicts with this contract.

Do not use this file to justify product-scope expansion. Preserve validated behavior unless a newer approved contract explicitly changes it.

## 2. Product identity: a Learning Reader, not a learning dashboard

CSForge is a local-first, single-user CS/backend learning application. Its primary purpose is to help one learner repeatedly do this:

`읽기 → 이해하기 → 문제로 확인하기 → 틀린 이유 이해하기 → 다시 학습하기 → 필요할 때 찾기`

The product may contain progress, accuracy, streak, review counts, heatmaps, filters, and operational state, but those are supporting information. They must not become the visual center of the product.

CSForge should feel like a calm personal learning reader combined with a focused practice loop. It should not feel like:

- a generic SaaS dashboard;
- an admin console;
- an analytics product;
- a marketing landing page;
- a component showcase;
- a developer tool whose content happens to be educational;
- a visual clone of another learning product.

The most important visual question is not `How much information can the screen show?` but `Can the learner understand what to study next and stay focused long enough to learn it?`.

Primary product loop:

`Home -> Learning -> Area -> Concept -> Quiz -> Result -> Wrong Notes -> Review -> Search`

Content supply loop:

`Markdown/JSON -> Validate -> Preview/Diff -> Confirm -> PostgreSQL`

## 3. Preserved behavior contracts

A redesign must not silently break validated product behavior.

Keep unless a newer approved decision changes them:

- Area/Concept Learning Rail collapse;
- collapse-state continuity within the same browser-tab session;
- Concept current-Topic priority and full-curriculum progressive disclosure;
- page-level scrolling instead of a Learning Rail scroll jail;
- Area URL-backed filter state preservation;
- Quiz autosave/resume and recovery states;
- grading, self-check, review scheduling, search, and import safety semantics;
- explicit loading, empty, error, retry, and recovery behavior;
- keyboard accessibility and native semantics;
- meaningful desktop validation at `1440x900` and `1280x900`.

Behavior may stay while presentation changes substantially.

## 4. Core design principles

### 4.1 Learning content first

Learning content and the next useful learning action outrank navigation chrome, metrics, badges, filters, environment information, and decoration.

When deciding visual weight, use this order:

1. current learning material or question;
2. next learning action;
3. orientation and progress needed for the current task;
4. supporting history, filters, and utilities;
5. analytics and operational metadata.

A screen that technically exposes every feature but makes the learner search for the actual learning task fails this contract.

### 4.2 Reading before decoration

CSForge contains long Korean technical prose. Typography, reading width, paragraph rhythm, heading hierarchy, code readability, and terminology are product features.

Do not solve hierarchy primarily with cards, colored borders, pills, or oversized headings. Use spacing, alignment, type size, weight, and section rhythm first.

### 4.3 Study workspace, not KPI dashboard

Cards are not the default information unit.

Prefer:

- document regions;
- curriculum outlines;
- flat rows with separators;
- compact toolbars;
- contextual side navigation;
- progressive disclosure;
- quiet state summaries.

Use a bordered or elevated container only when containment communicates a real state, decision, or interaction boundary.

### 4.4 One obvious next step

The learner should usually understand the next useful action without comparing multiple equally strong CTAs.

If an active Quiz exists, resuming it may outrank starting unrelated work. If Review is due, it should be visible near the primary flow. If neither exists, learning continuation should lead.

### 4.5 Progressive disclosure

Show what is necessary for the current decision first. Defer advanced filters, secondary curriculum scope, detailed analytics, operational diagnostics, keyboard help, and rare configuration until relevant.

### 4.6 Korean-first product language

Product labels, instructional copy, helper text, and learning prose are Korean-first.

Keep established technical names such as Java, Spring, HTTP, JVM, API, SQL, JPA, GC, CAS, MVCC, TCP, and exact code/protocol identifiers when translation would reduce precision.

Do not keep ordinary explanatory nouns in English merely because developers commonly encounter the English word. Follow `content/AGENTS.md` for canonical learning-content terminology.

## 5. Visual foundation

### 5.1 Light-first baseline

The canonical redesign baseline is light-first because sustained reading is the core task.

The first redesign slice must be visually validated in a light reading environment. Dark mode may be supported as an optional theme, but the product must not be designed as dark-only.

A reasonable implementation direction is:

- page: near-white neutral;
- reading surface: white or almost white;
- secondary grouped surface: light neutral gray;
- strong text: near-black neutral;
- body text: dark neutral gray;
- muted text: medium neutral gray;
- divider: low-saturation neutral gray;
- one restrained blue-family primary accent.

Exact token values are implementation decisions and must be browser-validated. Do not treat example hex values from discussion or mockups as immutable constants.

If dark mode is implemented, use neutral graphite/slate rather than near-black plus saturated blue everywhere. Preserve the same hierarchy and reading comfort rather than inventing a separate visual identity.

### 5.2 Accent usage

The primary accent is reserved for:

- keyboard focus;
- active navigation or curriculum location;
- the single primary action when one exists;
- links where link affordance matters;
- meaningful selected state.

Do not use the accent as general decoration, default border color, broad background tint, or repeated metadata color.

Semantic success/warning/error colors are for semantic state only.

### 5.3 Surface model

Use a small semantic surface set:

1. page/background;
2. reading or grouped section surface when necessary;
3. interactive/selected state;
4. overlay/dialog surface.

Do not create a different shade for every component.

Dense lists, curriculum rows, history, search results, and review lists should normally be flat or separated by subtle dividers instead of becoming independent bordered cards.

### 5.4 Borders, radius, and elevation

Borders are not the default method for proving that information exists.

Default direction:

- subtle dividers where separation is necessary;
- modest radius only for true grouped/interactable surfaces;
- little or no shadow in ordinary page content;
- stronger elevation only for overlays, menus, palettes, and dialogs;
- no repeated `surface + border + radius` treatment around every section.

If removing a border makes the hierarchy collapse, first check whether spacing, typography, or alignment should communicate the structure instead.

### 5.5 Spacing rhythm

Whitespace communicates hierarchy, not spectacle.

Use a small repeated spacing scale for:

- inline gaps;
- control gaps;
- row rhythm;
- section spacing;
- major route-region spacing.

Do not create a large empty hero area merely to make a page look designed.

## 6. Typography and Korean readability

Typography is part of the learning architecture.

### 6.1 Baseline direction

Implementation should validate approximately this hierarchy rather than mechanically copying exact numbers:

- application body: `15-16px`;
- long-form Concept body: `17-18px`;
- Concept body line-height: about `1.75-1.85`;
- Concept prose reading measure: about `680-720px` for ordinary paragraphs;
- Concept title: about `30-36px` on desktop;
- section heading: about `23-26px`;
- subsection heading: about `19-21px`;
- metadata/helper copy: normally not below `13-14px`;
- controls: normally `14-15px`;
- code: readable monospace around `14-15px` depending on the chosen font.

These are design targets, not a reason to introduce arbitrary one-off font sizes.

### 6.2 Hierarchy rules

- A route title must not behave like a marketing hero headline.
- The largest typography in a learning route should normally belong to the current learning subject, not motivational copy or metrics.
- Korean prose should use `word-break: keep-all` where it improves reading without causing harmful overflow.
- Weight and spacing should do more hierarchy work than extreme size contrast.
- Helper text must remain readable; do not turn useful guidance into faint microcopy.
- Code, commands, identifiers, and protocol fields use a clear monospace stack.

A Korean-oriented font such as Pretendard may be evaluated, but font adoption must consider readability, Latin/code pairing, bundle/local-first strategy, caching, and fallback behavior.

## 7. Content presentation and reading grammar

`content/AGENTS.md` owns canonical authoring quality. The UI must present that content in a way that reinforces the intended learning flow.

A strong Concept usually lets the learner move through this mental sequence:

`문제 상황/직관 -> 정확한 개념 -> 내부 동작/상태 변화 -> 예시 -> 실패 경계/오해 -> 실제 연결 -> 정리`

Not every Concept must use these labels literally, but the reading experience should make the progression understandable.

### 7.1 Technical terminology

Technical depth must not be confused with unnecessary English density.

Prefer:

- natural Korean explanation first;
- exact English technical term at the point where learning it adds value;
- one stable expression afterward.

For example, introducing `프로세스(Process)` once is preferable to writing ordinary Korean sentences as `process state`, `execution state`, `solution`, `failure`, `requirement`, and `trade-off` unless the English distinction itself matters.

### 7.2 Prose and lists

Connected explanatory paragraphs are the default.

Lists, tables, and diagrams are for actual comparison, state transition, sequence, constraints, or compact reference. Do not replace explanation with note-like fragments.

### 7.3 Callouts

Do not turn every important sentence into a colored box.

Reserve callouts for a small set of meanings such as:

- common misconception or warning;
- especially important boundary/contract;
- short practical connection that benefits from separation.

Callouts remain secondary to the main prose.

### 7.4 Code, tables, and diagrams

Code and diagrams should explain behavior, not decorate the article.

- code blocks may use wider overflow than prose;
- diagrams should clarify state, sequence, relationship, or execution flow;
- tables are for real comparison, not for turning prose into a grid;
- visual elements need readable captions or surrounding explanation when their meaning is not obvious.

## 8. Global shell and search

### 8.1 Global shell

Use a compact top navigation. There is no current requirement for a persistent global sidebar.

The shell should remain quieter than the current task and avoid consuming unnecessary vertical space.

Primary routes should remain quickly reachable, but environment and account metadata must not dominate the header.

`CLOUD`, email, and other operational/session details should normally move into a quiet account/settings affordance rather than occupying prime header space.

### 8.2 Global search

Search is a core learning-loop action, not a hidden utility.

On desktop, the header should expose an input-like search affordance large enough to be immediately discoverable. A target around `300-360px` may be evaluated depending on viewport width.

The control should communicate what can be searched, for example `개념, 문제, 오답 검색`.

The existing command-palette behavior and `Ctrl/Cmd + K` shortcut may remain. Clicking the persistent search affordance may open the palette rather than embedding the full search implementation in the header.

Do not reduce global search to a tiny icon/button on ordinary desktop layouts.

## 9. General route layout

Each route needs a clear task center.

Prefer:

- a constrained document column;
- outline + content composition;
- compact toolbars;
- flat lists and rows;
- section dividers;
- contextual side regions only when they help the current task.

Avoid:

- repeated card grids;
- large empty hero regions;
- large motivational copy that pushes useful content below the first viewport;
- symmetric layouts when the task has one obvious primary region;
- multiple equally saturated CTA blocks;
- operational metadata above the learning content without a current-task reason.

## 10. Route contracts

### 10.1 Home (`/`)

Purpose: tell the learner what to do next and make continuation immediate.

The Home route is not a KPI dashboard.

Priority order:

1. active Quiz resume when present;
2. due Review when meaningful;
3. recent/next Concept learning continuation;
4. curriculum entry points;
5. recent learning history;
6. analytics and long-term activity.

The first viewport should contain actual learning continuation, not a large motivational hero plus four statistic cards.

Preferred composition:

- compact `오늘의 학습` heading;
- one continuation block showing the actual Quiz or Concept title/context;
- due Review as a nearby secondary action;
- a short curriculum list or `다음 학습 영역` section;
- recent learning history when useful;
- `학습 통계 보기` or equivalent progressive disclosure for accuracy, solved count, streak, and heatmap.

Do not make solved count, accuracy, streak, or heatmap the product's visual identity.

When there is no history, suggest a small number of sensible curriculum entry points rather than showing an empty analytics dashboard.

### 10.2 Learning (`/learning`)

Purpose: choose where to continue learning.

Learning Areas should read as a curriculum index, not a card marketplace.

Prefer:

- recent/continuation context separated from the full curriculum;
- numbered or structured area rows;
- short Korean descriptions of what is learned;
- quiet progress state;
- one clear row-level continuation affordance.

Do not wrap every area in a visually heavy independent card.

### 10.3 Area (`/learning/{areaSlug}`)

Purpose: understand curriculum order, choose a Topic/Concept, and start reading.

The route should feel like a syllabus or course outline.

- Learning Rail provides orientation at Topic level;
- main content explains the current Topic and exposes its Concepts in order;
- progress and level remain visible but quiet;
- filters are secondary tools;
- the rail and main region must not redundantly present the same full curriculum with equal weight;
- URL-backed filter state survives equivalent navigation unless intentionally cleared.

### 10.4 Concept (`/concepts/{id}`)

Purpose: sustained reading and understanding.

The article is the visual center.

Desktop composition may use:

- left: quiet curriculum rail;
- center: constrained reading column;
- right: optional in-page table of contents when space genuinely permits.

The reading column must remain stable even on wide displays.

Before the article body, keep only necessary orientation:

- Area/Topic breadcrumb or compact context;
- Concept title;
- short Korean learning objective/summary;
- minimal metadata such as difficulty/estimated reading context only if it helps.

Do not place a wall of chips, completion controls, bookmark state, and Quiz CTAs above the first paragraph.

Completion, `복습 필요`, bookmark, and `문제 풀기` should be quiet utilities during reading and become more prominent after the article when the learner is ready to act.

A Concept should feel closer to a technical textbook/article than a dashboard panel.

Personal notes, references, related Quiz, previous/next Concept, and curriculum navigation remain valuable but visually secondary to the article.

### 10.5 Quiz Setup (`/quiz`)

Purpose: start practice quickly and configure only when necessary.

Quick starts and active-session resume come first.

Prefer simple entry points such as review questions, recently learned material, or area-based practice. Detailed filters belong behind `직접 설정` or another clear disclosure.

Do not make the learner configure every dimension before they can solve a problem.

### 10.6 Quiz Session (`/quiz/{id}`)

Purpose: focus on one question.

Question text and answer controls dominate the screen.

Navigation, timer, autosave, review-needed state, progress, and shortcuts stay available but visually subordinate.

Keyboard shortcuts are enhancement, not a headline feature. A small `?`/help disclosure is sufficient when discoverability is needed.

Correctness is never revealed before submission.

### 10.7 Quiz Result (`/quiz/{id}/result`)

Purpose: understand what was learned and resolve unfinished work.

The central question is not `What percentage did I score?` but `What should I understand or revisit now?`.

Priority:

1. finish self-check when required;
2. show questions that need attention;
3. explain why the answer is wrong/correct;
4. connect to related Concepts and Wrong Notes;
5. show compact overall performance;
6. offer unrelated new Quiz only after unresolved work.

Avoid turning the route into a celebratory score dashboard.

### 10.8 Wrong Notes

Purpose: revisit misunderstanding, not merely archive wrong attempts.

The detail experience should help answer:

- 무엇을 틀렸는가;
- 왜 틀렸는가;
- 어떤 개념을 놓쳤는가;
- 정답이 되는 이유는 무엇인가;
- 다음에는 무엇을 기준으로 구분해야 하는가.

Lists and mastery/due state dominate. Filters are secondary.

Cloud-disabled AI functionality must not appear as an ordinary available feature.

### 10.9 Review

Purpose: act on due material with minimal setup.

The route should prioritize what is due and starting the appropriate review flow. Window filters and scheduling information are supporting controls, not large visual blocks.

### 10.10 Search

Purpose: retrieve learned material and history quickly.

Search input and results dominate. Results are scan-first rows with clear match context. Filters may be denser and sticky where useful.

Infrastructure health remains visually quiet unless degraded state requires recovery.

### 10.11 Import

Purpose: safely complete `Select -> Preview -> Diff -> Confirm -> Result`.

Import may remain more tool-like and information-dense than learning routes.

Preview/diff and blocking errors must be visibly distinct from the final apply/confirm action. Unsafe apply remains unavailable.

## 11. Learning Rail

The Learning Rail is route-local curriculum navigation, not a second application shell.

Behavioral contract:

- Area and Concept rails can be collapsed;
- expanded curriculum rails use page scrolling rather than a nested vertical scroll jail;
- collapsed state reclaims content width;
- preference is preserved between Area and Concept within the same browser-tab session;
- Area rail exposes Topic progression;
- Concept rail prioritizes current Topic and its Concepts;
- full Area curriculum remains secondary through progressive disclosure;
- disclosure controls remain keyboard accessible and expose state semantically.

Visual contract:

- quiet document-outline character;
- active location clear without a large saturated block;
- hierarchy expressed by indentation, type, spacing, and subtle state treatment;
- readable Korean labels at normal zoom;
- rail decoration subordinate to reading content.

## 12. Components and interaction states

Every interactive or data-bearing feature deliberately covers the states that can actually occur:

- default;
- hover when relevant;
- focus-visible;
- selected/current;
- disabled;
- loading/pending;
- empty;
- error;
- retry/recovery;
- success/completed when useful.

### Buttons

Use one strong primary action only when the task genuinely has one. Secondary actions are quieter. Tertiary actions may use text/ghost treatment.

Do not fill a toolbar with multiple equally saturated buttons.

### Inputs and filters

Inputs must be readable and large enough to communicate purpose. Filter containers must not outweigh the content they operate on.

Prefer compact grouped controls or progressive disclosure over a large bordered filter card.

### Badges and chips

Badges are for meaningful compact state/taxonomy, not decoration. Plain secondary text is preferred for ordinary metadata.

### Feedback

Do not show duplicate toast and inline feedback for the same local action. Autosave and local editing state normally use local inline feedback.

Disabled actions with non-obvious reasons need nearby explanation.

## 13. Accessibility

At minimum:

- all actions are keyboard reachable;
- focus-visible is obvious in both light and dark themes;
- controls use correct button/link/input semantics;
- disclosure state is available through native semantics or ARIA;
- state does not rely on color alone;
- dialogs and palettes manage focus entry/return sensibly;
- external references remain identifiable as links;
- Korean labels are not clipped into unusable controls;
- redesign must not reduce target size or readability for visual compactness;
- text and interactive controls must maintain appropriate contrast in every supported theme.

Do not remove native semantics to simplify styling.

## 14. Desktop and responsive validation

V1 remains desktop-first, but meaningful layout work must not create a broken small-screen experience.

Primary browser review:

- `1440x900`;
- `1280x900`.

For meaningful shell/layout changes also inspect at least one narrower layout where navigation or rails collapse.

Validation questions are task-oriented rather than pixel-oriented.

### Home

- Is the next real learning action visible in the first viewport?
- Does analytics stay secondary?
- Does the page still make sense with no history?

### Concept

- Can the learner read for `10-20` minutes without UI chrome competing with the prose?
- Is paragraph width comfortable?
- Are Korean line breaks natural?
- Are code, diagrams, and callouts readable without overpowering the article?
- Is curriculum context available without becoming a sidebar product shell?

### Header/Search

- Is global search immediately discoverable on desktop?
- Is the shell visually quieter than the page task?
- Are environment/account details subordinate?

### Quiz

- Does the question dominate the viewport?
- Can the learner move, save, recover, and submit without navigation controls becoming the visual center?

## 15. Implementation strategy

Do not perform another repository-wide visual polish pass before validating the core reading experience.

Recommended redesign sequence:

1. visual tokens and typography foundation;
2. global header/search;
3. Home;
4. Concept reading experience;
5. Learning/Area curriculum experience;
6. Quiz Setup/Session;
7. Result/Wrong Notes/Review;
8. Search/Import consistency;
9. secondary polish and shortcuts;
10. obsolete CSS cleanup.

The first vertical slice is **Foundation + Header/Search + Home + Concept**. It must be browser-reviewed before propagating its visual language to the remaining routes.

When redesign touches a route:

- identify the actual owning stylesheet/component before changing appearance;
- consolidate duplicate or superseded rules instead of adding another final override layer;
- remove obsolete overrides when their responsibility is replaced;
- preserve validated behavior with focused tests;
- prefer shared semantic tokens and reusable primitives only where repetition is real;
- do not introduce a large abstract design-system framework before repeated needs justify it.

The target is a coherent frontend, not another layer of CSS patches.

## 16. Content-experience review gate

UI approval alone is not enough for a learning route.

For representative Concepts in every LearningArea, review these together:

- technical correctness;
- sufficient depth;
- natural Korean;
- unnecessary English density;
- whether a first-time learner can follow the explanation;
- whether the explanation connects intuition to exact terminology;
- whether the learner can explain the concept after reading;
- whether code/diagram/table usage improves understanding;
- whether the UI presentation supports rather than fights the content.

A technically correct Concept that reads like translated documentation is not automatically complete.

A visually polished Concept page that makes weak content look attractive is also not complete.

For the first redesign vertical slice, browser review must include at least one real long-form Concept rather than placeholder text. Prefer a Concept that currently exposes terminology/readability problems so the design is tested against difficult content, not an easy showcase sample.

## 17. Acceptance principle

Use this decision order for future UI/UX reviews:

`읽기 쉬운가 -> 무엇을 공부할지 분명한가 -> 학습 흐름이 자연스러운가 -> 필요한 조작이 쉬운가 -> 시각적으로 일관적인가`

Do not reverse this order.

A change is not approved merely because:

- CSS is cleaner;
- cards align well;
- responsive breakpoints do not overflow;
- colors are consistent;
- a screenshot looks polished.

The redesign succeeds when CSForge feels like a place where the user can actually study for a sustained session, understand the material, practice it, and return to what they misunderstood.