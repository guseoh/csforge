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

Existing frontend code is an implementation input, not a visual source of truth. A legacy layout, token, component shape, CSS override, or screen composition may be replaced when it conflicts with this contract.

## 2. Product experience

CSForge is a local-first, single-user CS/backend learning workspace. It should feel like a technical learning workbench and knowledge notebook: focused, precise, calm, and built for repeated study sessions.

It must not feel like:

- a marketing site;
- a generic SaaS dashboard;
- an admin console;
- an analytics product;
- a component gallery;
- a visual clone of another learning product.

Primary learning loop:

`Dashboard -> Learning -> Concept -> Quiz -> Result -> Wrong Notes -> Review -> Search`

Content supply loop:

`Markdown/JSON -> Validate -> Preview/Diff -> Confirm -> PostgreSQL`

The UI should help the user answer four questions quickly:

- Where am I?
- What is the current learning state?
- What is the most useful next action?
- How do I recover if that action is unavailable or fails?

## 3. Visual independence

CSForge must have its own visual language.

### Foundry is not a visual precedent

Foundry is no longer a visual target, visual influence, or preservation constraint for CSForge.

Do not preserve a screen, shell, card composition, color treatment, spacing pattern, navigation treatment, or component shape merely because the current implementation resembles Foundry or because that structure already exists in CSS.

When redesigning an existing screen:

- preserve validated CSForge product behavior and learning-flow contracts;
- re-evaluate the visual composition independently;
- remove recognizable Foundry-like presentation where it does not serve a CSForge-specific reason;
- do not use Foundry screenshots, dimensions, colors, component arrangements, or taxonomy as implementation targets.

Behavioral ideas that are already independently justified by CSForge usage may remain. Their visual treatment must still follow this contract.

### Existing UI is not automatically canonical

PR #51 validated several interaction contracts, but it did not make every current pixel, surface, color, spacing rule, or component hierarchy permanent.

Keep the validated behavior. Redesign the presentation when needed.

Examples of behavior worth preserving include:

- Area/Concept Learning Rail collapse;
- collapse-state continuity within the browser-tab session;
- Concept current-Topic priority and full-curriculum progressive disclosure;
- page-level scrolling instead of a Learning Rail scroll jail;
- Area URL filter preservation;
- Quiz recovery states;
- explicit loading/empty/error/recovery behavior;
- browser validation at 1440x900 and 1280x900.

## 4. Core design principles

### Learning first

Learning content and the next learning action outrank navigation chrome, operational metadata, filters, metrics, and decoration.

Do not give every available control equal visual weight. Secondary configuration belongs behind progressive disclosure or in a quieter control group when it would otherwise dominate the task.

### Workbench, not dashboard

Prefer a workspace composed from document regions, lists, outlines, tool rows, and compact state summaries over a grid of equally weighted cards.

A card is not the default unit of information. Use a card only when containment communicates a real grouped state, decision, or action boundary.

### Daily-use density

Optimize for repeated desktop use rather than presentation screenshots. A screen may be dense when scanning is the task, but it should not be noisy.

Use task-appropriate density:

- Concept and Quiz Session: low density, sustained focus;
- Dashboard, Learning, Result, Review: medium density, action/state hierarchy first;
- Search and Import: medium-high density, scanning/comparison efficiency first.

Density is a product judgment, not a numeric target.

### Calm technical character

CSForge should feel closer to a focused editor/documentation workspace than to a colorful consumer dashboard.

Prefer:

- quiet neutral backgrounds;
- clear typography;
- subtle dividers;
- compact controls;
- restrained state color;
- consistent spacing rhythm;
- deliberate emphasis.

Avoid decorative gradients, broad glow, glass effects, oversized promotional headings, excessive badges, and large floating-card compositions unless a concrete use case requires them.

### Progressive disclosure

Show what is needed for the current decision first. Defer secondary curriculum scope, advanced filters, detailed setup, operational diagnostics, and destructive/commit-like actions until relevant.

### Preserve product contracts

A visual redesign must not silently change URL state, quiz grading, review scheduling, search semantics, import safety, autosave, recovery, or navigation behavior.

When a visual change touches interactive state, add focused regression coverage where practical.

## 5. Visual foundations

### Color direction

Do not treat the current purple/blue-heavy implementation as a permanent palette.

The redesign should move toward a neutral technical workspace:

- graphite, charcoal, neutral slate, or near-neutral dark page backgrounds;
- surfaces separated mainly by luminance, border, and spacing rather than saturated hue;
- one restrained primary accent for focus, selection, and important action;
- semantic success/warning/error colors used only where state meaning requires them.

The exact values are implementation decisions and must be validated visually. Do not copy another product's palette.

Accent color is primarily for:

- keyboard focus;
- current navigation/selection;
- primary action;
- meaningful inline emphasis.

Do not use the accent as general decoration or as a default border for every interactive surface.

State must never rely on color alone; pair it with text, iconography, shape, or position.

### Surface model

Prefer a small number of semantic layers:

1. page/background;
2. grouped section or document surface when needed;
3. interactive/selected state;
4. overlay/dialog surface.

Do not create a new shade for every component.

Dense lists, curricula, search results, and history rows normally use a flat surface with dividers or subtle row states rather than one bordered card per item.

### Borders, radius, and elevation

Use borders and spacing before shadows.

Default direction:

- subtle 1px dividers/borders;
- modest corner radii;
- fewer pill-shaped containers;
- little or no shadow in normal document/workspace regions;
- stronger elevation only for overlays, command palettes, dialogs, and menus.

Do not increase radius, border contrast, or card chrome merely to make a screen look more designed.

### Spacing rhythm

Use a small, repeated spacing scale rather than ad-hoc gaps.

Distinguish clearly between:

- inline spacing;
- control spacing;
- row spacing;
- section spacing;
- major route-region spacing.

Whitespace should communicate hierarchy, not create large empty presentation areas.

### Icons

Icons support recognition but do not carry critical meaning alone.

Do not add a new icon library solely for polish. Reuse a coherent existing set or introduce one only as an approved design-system decision. Important actions retain clear text labels where ambiguity is possible.

### Badges and chips

Badges are for compact state or taxonomy, not general decoration.

Avoid turning every metadata value into a colored pill. Prefer plain secondary text for low-priority metadata and reserve badges for states that benefit from immediate recognition.

## 6. Typography and Korean readability

CSForge is Korean-first. Product-domain labels and instructional/action copy should use natural Korean such as `개념`, `학습 영역`, `문제`, and `복습` when that is the clearest user-facing expression. Keep established technical names such as Java, Spring, HTTP, JVM, API, and AI when translation would reduce precision.

Typography should feel like a technical reading/productivity tool, not a landing page.

Requirements:

- long-form Concept prose must have a comfortable reading measure and generous line height;
- headings establish hierarchy without oversized hero treatment;
- route titles should normally be compact enough that useful content remains visible in the first viewport;
- helper text must remain readable, not become decorative microcopy;
- use `word-break: keep-all` where it improves Korean prose without causing harmful overflow;
- code, identifiers, and commands use a clear monospace stack;
- weight contrast should do more work than extreme size contrast.

Pretendard or another Korean-oriented typeface may be evaluated during redesign, but no font is mandatory by default. If a font changes, evaluate Korean readability, Latin/code pairing, local-first asset strategy, size, caching, and fallback behavior before adoption.

Do not preserve the current font stack solely because it already exists.

## 7. Global shell and layout hierarchy

### Global shell

The current product contract is a compact global top navigation plus route content. There is no requirement for a persistent global sidebar.

The topbar may be visually redesigned. Its current height, colors, brand mark, spacing, and control treatment are not canonical.

The shell should:

- keep primary routes quickly reachable;
- remain visually quieter than the current task;
- avoid consuming unnecessary vertical space;
- keep global search accessible;
- preserve the local-environment context without making it a dominant badge.

Do not introduce a persistent global sidebar unless an approved task identifies a product need for one.

### General route layout

Each route should establish a clear task center rather than fill all available width indiscriminately.

Prefer:

- document columns;
- outline + content structures;
- compact toolbars;
- list/row layouts;
- section dividers;
- contextual side regions when they support the current task.

Avoid:

- repeated dashboard-card grids;
- large empty hero regions;
- symmetric layouts when the task has an obvious primary region;
- multiple equally strong CTA blocks.

### Concept reading layout

Concept detail is a reading workspace.

- Long-form prose width stays constrained even on wide screens.
- Code blocks, tables, and diagrams may use wider internal overflow where necessary.
- Breadcrumb/curriculum context supports orientation but does not compete with title/body.
- Reading progress, notes, references, previous/next, related Concepts, and Quiz continuation are visually secondary to the article itself.
- The right-side in-page TOC, when present, behaves like documentation navigation rather than a dashboard panel.

### Learning Rail

The Learning Rail is route-local curriculum navigation. It exists to preserve learning context, not to become a second application shell.

Behavioral contract:

- Area and Concept rails can be collapsed by the user;
- expanded primary curriculum rails use the page's vertical scroll rather than creating a nested vertical scroll jail;
- collapsed state uses a narrow compact rail and reclaims real content width;
- collapse preference is preserved between Area and Concept within the same browser-tab session;
- Area rail exposes Topic progression directly;
- Concept rail prioritizes the current Topic and its Concepts;
- the full Area curriculum is secondary and uses progressive disclosure such as `전체 주제 보기`;
- opening the full curriculum produces an actual layout/state change and remains keyboard accessible;
- a bounded secondary TOC may scroll only when necessary to keep its own links reachable;
- collapse/disclosure controls use real buttons/summary controls, visible focus, and appropriate `aria-expanded` semantics.

Visual contract:

- the rail should read as a quiet document outline, not a prominent product sidebar;
- active location is clear without a large saturated block;
- hierarchy is expressed with indentation, type, spacing, and subtle state treatment;
- Topic/Concept labels remain readable at normal zoom;
- rail decoration is subordinate to the reading/curriculum content.

Do not reintroduce a nested rail scrollbar merely to keep the rail sticky.

## 8. Route-specific hierarchy

### Dashboard

Purpose: show current learning state and make the best next action obvious.

The Dashboard must not be a generic KPI-card dashboard.

Preferred composition:

- one primary continuation/resume region;
- due Review or unfinished work near the primary flow;
- compact progress/state summaries;
- recent activity or curriculum context only when it helps the next decision.

Avoid a uniform grid of statistic cards with equal weight.

Priority normally follows active Quiz resume, due Review, and learning continuation before secondary analytics.

### Learning

Purpose: choose where to continue learning.

Learning Areas should feel like a curriculum index, not a marketplace/card catalog.

Prefer compact area rows or structured sections that expose useful progress/state without oversized tiles. Recent/continuation context should be distinct from the full curriculum.

### Area

Purpose: understand the curriculum structure, choose a Topic/Concept, and start reading.

The route should feel like a course outline or technical syllabus.

- Learning Rail provides orientation.
- Main content exposes Concepts as readable rows/sections rather than promotional cards.
- Progress and level are visible but quiet.
- Search, level, progress, bookmark, and sort controls are secondary tools.
- URL-backed filter state survives equivalent navigation actions unless the user intentionally clears it.

### Concept

Purpose: sustained reading plus explicit learning actions.

Reading content is the visual center.

- Completion action is available without becoming a large dashboard CTA block.
- `복습 필요` is secondary.
- Bookmark is tertiary/secondary.
- Related Quiz is a continuation action after reading, not a competing primary panel.
- Supporting metadata should not form a dense wall above the article title.

### Quiz Setup

Purpose: start quickly, configure only when necessary.

Quick presets and active-session resume come before detailed configuration. Advanced filters and implementation-oriented values remain de-emphasized.

Avoid presenting every configuration option as an equal card or panel.

### Quiz Session

Purpose: focus on the current question.

Question body and choices/input dominate. Navigation, timer, autosave, review-needed, and shortcuts remain available but visually subordinate. Correctness is never revealed before submission.

The session should feel closer to a focused work surface than a dashboard.

### Quiz Result

Purpose: understand performance and resolve unfinished learning work.

Priority:

1. finish self-check when required;
2. retry or inspect wrong questions;
3. move to Wrong Notes/related Concepts/Review;
4. start an unrelated new Quiz.

Do not make a new Quiz the strongest action while unresolved self-check or wrong work exists.

Use compact summary/state treatment rather than a celebratory dashboard unless a future product decision explicitly calls for it.

### Wrong Notes and Review

Purpose: select the most useful material to revisit and act on it.

Lists and due/mastery information dominate. Filters are secondary. Empty product state and empty filtered result are different states and must not be presented as the same problem.

Prefer list hierarchy and small state markers over card-heavy presentation.

### Search

Purpose: retrieve learning material/history quickly.

Search input and results dominate. Results are scan-first rows with clear match context. Filters may be denser and sticky where useful. Healthy infrastructure status stays visually quiet and becomes explicit only when recovery is required.

### Import

Purpose: make `Select -> Preview -> Diff -> Confirm -> Result` safe and obvious.

This route may be denser and more tool-like than learning routes.

Preview/diff and blocking errors must be visually distinct from the final confirm action. A commit-like import action stays unavailable when the current preview cannot safely apply.

## 9. Components and interaction states

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

### Buttons

Use visual strength according to action hierarchy:

- one primary action where the task genuinely has one;
- secondary actions quieter but still obvious;
- tertiary actions may use text/ghost treatment.

Do not fill a toolbar with multiple equally saturated primary buttons.

### Inputs and filters

Controls should be compact and readable. Filter containers should not visually outweigh the results they operate on.

Prefer grouped controls, progressive disclosure, or a compact toolbar before a large bordered filter card.

### Feedback

Do not add duplicate toast and inline feedback for the same autosave or request outcome. Prefer local inline status for local actions such as note or answer autosave.

Disabled actions with a non-obvious reason need nearby explanation.

## 10. Accessibility

At minimum:

- all actions are keyboard reachable;
- focus-visible treatment is obvious on dark surfaces;
- button/link/input semantics match the interaction;
- disclosure state is exposed through native semantics or ARIA where needed;
- state does not rely on color alone;
- dialogs/palettes preserve sensible focus entry/return;
- external references remain identifiable as links;
- long labels and Korean text are not clipped into unusable controls;
- compact redesign must not reduce target size or readability below practical desktop accessibility.

Do not remove native semantics merely to simplify styling.

## 11. Desktop viewport contract

V1 remains desktop-first; this file does not introduce a mobile-first redesign.

Visual QA baseline for meaningful layout changes:

- primary review: `1440x900`;
- minimum dense-desktop regression: `1280x900`;
- wider-layout spot-check when a change materially uses extra width.

At the minimum desktop width verify:

- no document-level horizontal overflow unless explicitly required by an inner code/table surface;
- navigation and content do not overlap;
- primary actions remain reachable;
- helper labels remain readable;
- collapsed rails actually reclaim space;
- sticky/fixed elements do not collide;
- compact controls do not become cramped or ambiguous.

Existing smaller-screen CSS may remain, but new mobile navigation or touch-first behavior requires its own approved task.

## 12. Visual QA and evidence

Do not approve a substantial UI change from code review or a scaled full-page PDF alone.

For meaningful UI work:

1. inspect the real route in Chromium with representative local data;
2. verify the first useful viewport as well as full-page flow;
3. inspect interaction states that materially change layout or behavior;
4. verify at least the primary and minimum desktop widths when layout changed;
5. check horizontal overflow, clipping, sticky/fixed collisions, readable line length, focus, disabled state, and recovery UI;
6. record critical console errors;
7. compare before/after evidence when fixing a specific visual defect;
8. explicitly review whether the result still resembles an external reference product more than CSForge's own contract.

When two screenshots are intended to prove different states, validate the DOM state before capture and ensure the artifacts are actually distinct. Do not treat capture success as proof that the intended interaction happened.

Browser evidence should normally stay outside the repository unless the artifact has a durable repository purpose.

## 13. Copy and content presentation

- Prefer natural Korean for instructional/action copy.
- Keep established technical terms when translation would reduce precision.
- Avoid arbitrary Korean/English alternation in adjacent controls.
- Canonical Markdown must render as Markdown on detail screens; compact list/search previews must not expose raw Markdown syntax.
- Do not change canonical learning content merely to solve a presentation defect.
- Avoid marketing language, congratulatory filler, and generic dashboard copy where direct study-oriented language is clearer.

## 14. Redesign and migration rules

The current frontend contains multiple generations of CSS and correction layers. Do not keep adding override files indefinitely.

For the independent visual redesign:

- identify the actual owning stylesheet/component before changing appearance;
- consolidate duplicate or superseded visual rules when the redesign touches them;
- remove obsolete overrides when their responsibility is replaced;
- avoid mass rewrites unrelated to the current route/workstream;
- preserve validated behavior with focused tests while simplifying visual implementation;
- prefer shared semantic tokens and reusable primitives when repetition is real;
- do not build a large abstract design-system framework before repeated needs justify it.

The target is a coherent frontend, not another layer of CSS patches on top of the Foundry-like implementation.

### Recommended redesign sequence

Unless an approved task changes the order:

1. visual foundation and global shell;
2. Dashboard and Learning as reference implementations;
3. Area and Concept;
4. Quiz Setup, Quiz Session, and Result;
5. Wrong Notes and Review;
6. Search and Import;
7. whole-flow browser audit and cleanup.

Do not apply a new visual direction to every route before the reference screens have been reviewed in-browser.

## 15. Governance

Before changing frontend UI/UX:

1. read `AGENTS.md`, `docs/MVP_V1.md`, this file, and the current Issue/approved task;
2. inspect the current implementation and representative route before redesigning it;
3. distinguish validated behavior from legacy visual precedent;
4. preserve router/query/application contracts unless the task explicitly changes them;
5. prefer a coherent correction over a speculative framework/icon/font/tool adoption;
6. validate the final state in the browser when the change is visual or interaction-heavy.

Update this file only when a repeated, durable product-design rule changes. Do not record one-off pixel adjustments, temporary experiments, or every PR decision here.

External design systems and skills are references, not canonical sources. Do not install or apply them automatically merely because they exist.

## 16. Non-binding references

External references may be used to study general design problems such as reading hierarchy, navigation clarity, keyboard interaction, or density. They must not be used as a visual target.

Current non-binding references:

- Mintlify: documentation information architecture and reading hierarchy;
- Linear: restraint, hierarchy, and deliberate emphasis;
- external DESIGN.md or agent skills: workflow/reference material only.

Foundry is intentionally excluded from the reference list because CSForge is moving away from an implementation that visually resembles it too closely.

Copy a broadly useful problem-solving principle only when it independently fits CSForge. Do not copy another product's taxonomy, page composition, pixels, palette, branding, component shapes, or recognizable visual identity.
