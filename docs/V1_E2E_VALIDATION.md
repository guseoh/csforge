# V1 end-to-end validation

This document records the repeatable validation boundary for the local-only V1
learning loop. It is intentionally separate from the product requirements in
`MVP_V1.md` and does not provision, migrate, or destroy the normal local
Compose data volume.

## Safety boundary

Use a disposable PostgreSQL container and a distinct host port for destructive
or fresh-state validation. Verify the database has no public tables before
starting the application. Remove only that named disposable container after
the run. Never use `docker compose down -v` for this validation.

The canonical data source is the repository's `content/` pack. Exclude
`content/examples/`, `content/curriculum/`, and other non-canonical fixtures
when measuring the full pack. Import batches must stay within the API limits
of 100 files and 1,000 items; keeping batches below those limits also makes
the run easier to resume and diagnose.

## Baseline and final gates

Run from the repository root unless noted otherwise:

```powershell
Push-Location frontend
npm ci
npm test
npm run lint
npm run build
Pop-Location

Push-Location backend
.\gradlew.bat test
.\gradlew.bat build
Pop-Location

git diff --check
docker compose config --quiet
```

For a clean integration-test run, use `.\gradlew.bat test --rerun-tasks`.
Capture the first actionable failure rather than repeating an unchanged
environment failure. If Ollama is unavailable, record `BLOCKED_BY_ENVIRONMENT`
and do not install or pull a model.

## Validation matrix

| Boundary | Required evidence |
| --- | --- |
| Import | Preview/apply the canonical pack; verify created counts and no errors; re-import the exact same files and verify all items are `UNCHANGED`. |
| Revision safety | Update one existing concept through the real preview/apply API and verify its Markdown, personal note, progress/bookmark, wrong note, review schedule, and attempt history remain coherent. |
| Learning | Load area, topic, concept detail, Markdown, references, navigation, progress, bookmark, and note autosave through the UI/API. |
| Quiz lifecycle | Cover availability, create, active-session resume, answer autosave, position persistence, submit, automatic grading, self-check, wrong-only retry, expiry, and invalid transitions. |
| Wrong notes/review | Verify grouping by question, historical attempts, retry, schedule stages `1d -> 3d -> 7d -> 14d`, wrong reset to stage 1, and mastered behavior. |
| Dashboard | Verify Seoul-day aggregation, finalized-attempt accuracy, heatmap, area progress, weak topics, recent quizzes, active quiz, and pending self-check state. |
| Search | Verify full reindex, all document types, Korean/Nori matching, technical identifiers, filtering/sorting/pagination, incremental outbox convergence, malformed-event DLQ, and recovery after reindex. |
| AI | Verify disabled and unconfigured states; with a real provider, verify request snapshot, current-attempt ownership, retryable failure, bounded retry, and concurrency. |
| Restart | Stop and restart the application against the isolated database; verify the active quiz, note, progress/bookmark, wrong note, and review state are restored. |
| Failure handling | Use the automated relay/search/reindex tests for Kafka and Elasticsearch failure paths. Do not stop the user's normal Compose services to simulate an outage. |

## 2026-09-05 run record

The Phase A run imported 870 canonical files: 15 learning areas, 15 topic
files containing 134 topics, 721 Markdown concepts, and 134 question files
containing 2,449 questions. The first import created 3,304 items with zero
updates, unchanged items, skips, or errors. The exact re-import classified all
3,304 items as `UNCHANGED`.

The isolated revision check preserved a personal note, `LEARNING` progress,
bookmark state, one wrong note, its stage-1 scheduled review, and the original
attempt after updating the concept content. An active wrong-only retry was
blocked until the descriptive self-check was completed, then resumed as a new
quiz. Restart restored the active quiz and the persisted personal state.

The final frontend gate passed 49 tests, lint, and build. The clean backend
gate passed 88 tests with zero failures or skips, including five full-stack
search tests, and the backend build. The normal search projection was rebuilt
from PostgreSQL and finished `READY` with 1,808 documents and zero pending
outbox events. Chromium route checks passed at 1440×900 and 1366×768 with no
page-level errors or horizontal overflow.
