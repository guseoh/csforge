# CSForge Frontend Agent Instructions

These instructions apply to work under `frontend/` and supplement the repository-root `AGENTS.md`.

Before changing frontend UI/UX, read the repository-root `DESIGN.md` together with `AGENTS.md`, `docs/MVP_V1.md`, and the current approved task/Issue.

- Treat `DESIGN.md` as the product-owned UI/UX contract, subordinate to explicit user decisions and the current approved task.
- Preserve router/search/query/business behavior while changing presentation unless the task explicitly changes the contract.
- Use the current implementation and real browser state before importing patterns from external products or design skills.
- For meaningful visual/layout changes, validate representative Chromium states at the viewport boundaries defined in `DESIGN.md`.
- Do not add a UI framework, icon library, webfont, design skill, or MCP merely for polish without an approved need.
- Update `DESIGN.md` only for durable repeated design rules, not one-off pixel fixes.
