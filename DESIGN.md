# CSForge Design Contract

## 1. Purpose

This file is the product-owned UI/UX contract for CSForge.

Use it for frontend work that changes layout, visual hierarchy, navigation, interaction states, responsive behavior, or user-facing copy. It is not a replacement for `AGENTS.md`, `docs/MVP_V1.md`, an approved Issue/PR contract, or an explicit user decision.

When sources conflict, follow this order:

1. the user's current explicit decision;
2. the current approved Issue/PR contract;
3. `AGENTS.md`;
4. `docs/MVP_V1.md`;
5. this file;
6. existing implementation details and external references.

Do not use this file to justify a product-scope expansion.

## 2. Product experience

CSForge is a local-first, single-user CS/backend learning workspace. It should feel like a focused technical study tool, not a marketing site, admin console, analytics dashboard, or generic component gallery.

Primary learning loop:

`Dashboard -> Learning -> Concept -> Quiz -> Result -> Wrong Notes -> Review -> Search`

Content supply loop:

`Markdown/JSON -> Validate -> Preview/Diff -> Confirm -> PostgreSQL`

The UI should help the user answer four questions quickly:

- Where am I?
- What is the current learning state?
- What is the most useful next action?
- How do I recover if that action is unavailable or fails?

## 3. Core design principles

### Learning first

Learning content and the next learning action outrank navigation chrome, operational metadata, filters, and decoration.

Do not make every available control visible at equal weight. Secondary configuration belongs behind progressive disclosure when it would otherwise dominate the task.

### Daily-use density

Optimize for repeated desktop use rather than presentation screenshots. A screen may be dense when scanning is the task, but it should not be visually noisy.

Use task-appropriate density:

- Concept and Quiz Session: low density, sustained focus;
- Dashboard, Learning, Result, Review: medium density, action and state hierarchy first;
- Search and Import: medium-high density, scanning and comparison efficiency first.

Density is a product judgment, not a numeric target.

### Calm technical workspace

Keep the existing dark-first identity. Prefer restrained surfaces, thin borders, modest radii, and one clear accent over decorative gradients, excessive glow, glass effects, or marketing-style cards.

The interface should feel deliberate and quiet even when data is dense.

### Progressive disclosure

Show what is needed for the current decision first. Defer secondary curriculum scope, advanced filters, detailed setup, operational diagnostics, and destructive/commit-like actions until they are relevant.

### Preserve product contracts

A visual refactor must not silently change URL state, quiz grading, review scheduling, search semantics, import safety, autosave, recovery, or navigation behavior.

When a visual change touches interactive state, add focused regression coverage where practical.

## 4. Visual foundations

### Color and surfaces

Reuse the existing frontend color vocabulary and CSS variables/classes before creating new one-off values.

Maintain a small semantic hierarchy:

- page background;
- elevated/group surface;
- interactive surface;
- selected/current surface;
- default/subtle/strong border;
- primary text;
- secondary/helper text;
- accent;
- success/completed;
- review/warning;
- error.

Accent color is primarily for current selection, primary action, focus, and meaningful emphasis. Do not scatter accent color as decoration.

State must never rely on color alone; pair it with text, iconography, shape, or position.

### Borders, radius, and elevation

Prefer borders and subtle surface differences over strong drop shadows. Use shadows only when an element truly needs elevation, such as an overlay or a visual object that must separate from content.

Do not increase radius or card chrome merely to make a screen look more designed.

### Icons

Do not add a new icon library solely for polish. Reuse existing symbols/components where they remain understandable and accessible. Text labels should carry the meaning for important actions.

## 5. Typography and Korean readability

CSForge is Korean-first while retaining established technical terms such as Java, Spring, HTTP, Quiz, Concept, Learning Area, and AI where they improve precision.

Requirements:

- long-form Concept prose must have a comfortable reading measure and generous line height;
- headings must establish a clear reading hierarchy without oversized landing-page treatment;
- helper text must remain readable, not be reduced until it becomes decorative noise;
- use `word-break: keep-all` where it improves Korean prose without causing harmful overflow;
- code, identifiers, and commands may use the existing monospace stack;
- do not introduce or replace the product font family without a visual comparison and an explicit reason.

Pretendard or another Korean webfont is not a default requirement. Font loading, local-first behavior, asset size, and fallback behavior must be considered before adoption.

## 6. Layout hierarchy

### General desktop layout

Use the existing topbar/sidebar shell. Route content should establish one primary column or task center rather than filling all available width indiscriminately.

Prefer rows and dividers for dense curriculum/result lists. Use cards when a grouped state, summary, or action genuinely benefits from a contained surface.

Avoid large empty hero regions that push the useful task below the first viewport.

### Concept reading layout

Concept detail is a reading workspace.

- Keep long-form prose width constrained even on wide screens.
- Code blocks, tables, and diagrams may use wider internal overflow when necessary.
- Breadcrumb/curriculum context supports orientation but must not compete with the Concept title and body.
- Follow-up content such as notes, references, previous/next, related Concepts, and related Quiz actions comes after the reading task with clear section separation.

### Learning Rail

The Learning Rail is secondary curriculum navigation. It exists to preserve learning context, not to become a second application shell.

Contract:

- Area and Concept rails can be collapsed by the user.
- Expanded primary curriculum rails use the page's vertical scroll rather than creating a nested vertical scroll jail.
- Collapsed state uses a narrow compact rail and must reclaim real content width, not only hide rail content.
- The collapse preference is preserved between Area and Concept within the same browser-tab session.
- Area rail exposes Topic progression directly.
- Concept rail prioritizes the current Topic and its Concepts; the full Area curriculum is secondary and uses progressive disclosure such as `전체 주제 보기`.
- Opening the full curriculum must produce an actual layout/state change and remain keyboard accessible.
- A bounded secondary TOC may scroll only when necessary to keep its own links reachable; it must not control the main reading scroll.
- Collapse/disclosure controls use real buttons/summary controls, visible focus, and appropriate `aria-expanded` semantics.

Do not reintroduce a nested rail scrollbar merely to keep the rail sticky.

## 7. Route-specific hierarchy

### Dashboard

Purpose: current state plus one obvious next useful action.

Priority normally follows active Quiz resume, due Review, and learning continuation before secondary analytics. KPI and activity information should be glanceable but must not compete with the next action.

### Learning

Purpose: choose where to continue learning.

Recent/continuation context should be visually distinct from the curriculum. Area summaries must remain scannable; do not turn them into marketing tiles.

### Area

Purpose: choose a Topic/Concept and start reading.

Curriculum navigation is primary. Search, level, progress, bookmark, and sort controls are secondary tools. URL-backed filter state must survive equivalent navigation actions unless the user intentionally clears it.

### Concept

Purpose: sustained reading plus explicit learning actions.

Reading content is the visual center. Complete is the main completion action when applicable; review-needed is secondary; bookmark is tertiary/secondary; related Quiz is a continuation action, not a competing primary action.

### Quiz Setup

Purpose: start quickly, configure only when necessary.

Quick presets and active-session resume come before detailed configuration. Advanced filters and implementation-oriented deep-link values stay de-emphasized.

### Quiz Session

Purpose: focus on the current question.

Question body and choices/input dominate. Navigation, timer, autosave, review-needed, and shortcuts remain available but visually subordinate. Correctness is never revealed before submission.

### Quiz Result

Purpose: understand performance and resolve unfinished learning work.

Priority:

1. finish self-check when required;
2. retry or inspect wrong questions;
3. move to Wrong Notes/related Concepts/Review;
4. start an unrelated new Quiz.

Do not make a new Quiz the strongest action while unresolved self-check or wrong work exists.

### Wrong Notes and Review

Purpose: select the most useful material to revisit and act on it.

Filters are secondary to the list and current due/mastery state. Empty product state and empty filtered result are different states and must not be presented as the same problem.

### Search

Purpose: retrieve learning material/history quickly.

Search input and results dominate. Filters may be denser and sticky where useful. Derived-infrastructure status is secondary while healthy and explicit only when recovery is required.

### Import

Purpose: make `Select -> Preview -> Diff -> Confirm -> Result` safe and obvious.

Preview/diff and blocking errors must be visually distinct from the final confirm action. A commit-like import action stays unavailable when the current preview cannot safely apply.

## 8. Components and interaction states

Every interactive or data-bearing feature should deliberately cover the states that can actually occur:

- default;
- hover when relevant;
- focus-visible;
- selected/current;
- disabled;
- loading/pending;
- empty;
- error;
- recovery/retry;
- success/completed when useful.

Do not add duplicate toast and inline feedback for the same autosave or request outcome. Prefer local inline status for local actions such as note or answer autosave.

Disabled actions with a non-obvious reason need nearby explanation.

## 9. Accessibility

At minimum:

- all actions are keyboard reachable;
- focus-visible treatment is obvious on dark surfaces;
- button/link/input semantics match the interaction;
- disclosure state is exposed through native semantics or ARIA where needed;
- state does not rely on color alone;
- dialogs/palettes preserve sensible focus entry/return;
- links to external references remain identifiable;
- long labels and Korean text must not be clipped into unusable controls.

Do not remove native semantics merely to simplify styling.

## 10. Desktop viewport contract

V1 remains desktop-first; this file does not introduce a mobile-first redesign.

Visual QA baseline for meaningful layout changes:

- primary review: `1440x900`;
- minimum dense-desktop regression: `1280x900`;
- wider layout spot-check when the change materially uses extra width.

At the minimum desktop width verify:

- no document-level horizontal overflow unless explicitly required by an inner code/table surface;
- navigation and content do not overlap;
- primary actions remain reachable;
- helper labels remain readable;
- collapsed rails actually reclaim space;
- sticky/fixed elements do not collide.

Existing smaller-screen CSS may remain, but new mobile navigation or touch-first behavior requires its own approved task.

## 11. Visual QA and evidence

Do not approve a substantial UI change from code review or a scaled full-page PDF alone.

For meaningful UI work:

1. inspect the real route in Chromium with representative local data;
2. verify the first useful viewport as well as full-page flow;
3. inspect interaction states that materially change layout or behavior;
4. verify at least the primary and minimum desktop widths when layout changed;
5. check horizontal overflow, clipping, sticky/fixed collisions, readable line length, focus, disabled state, and recovery UI;
6. record critical console errors;
7. compare before/after evidence when fixing a specific visual defect.

When two screenshots are intended to prove different states, validate the DOM state before capture and ensure the artifacts are actually distinct. Do not treat capture success as proof that the intended interaction happened.

Browser evidence should normally stay outside the repository unless the artifact has a durable repository purpose.

## 12. Copy and content presentation

- Prefer natural Korean for instructional/action copy.
- Keep established technical terms when translation would reduce precision.
- Avoid arbitrary Korean/English alternation in adjacent controls.
- Canonical Markdown must render as Markdown on detail screens; compact list/search previews must not expose raw Markdown syntax.
- Do not change canonical learning content merely to solve a presentation defect.

## 13. Governance

Before changing frontend UI/UX:

1. read `AGENTS.md`, `docs/MVP_V1.md`, this file, and the current Issue/approved task;
2. inspect the current implementation and representative route before redesigning it;
3. preserve existing router/query/application contracts unless the task explicitly changes them;
4. prefer a targeted correction over a new framework, icon library, or design-system abstraction;
5. validate the final state in the browser when the change is visual or interaction-heavy.

Update this file only when a repeated, durable product-design rule changes. Do not record one-off pixel adjustments, temporary experiments, or every PR decision here.

External design systems and skills are references, not canonical sources. Do not install or apply them automatically merely because they exist.

## 14. Non-binding influences

These references may help explain the desired direction, but they must not override CSForge's own product contract:

- Mintlify: documentation-oriented information architecture and reading hierarchy;
- Linear: restrained dark surfaces and deliberate accent usage;
- Foundry: guided learning/navigation patterns;
- external DESIGN.md or agent skills: workflow/reference material only.

Copy the problem-solving idea, not another product's taxonomy, pixels, branding, or component shapes.
