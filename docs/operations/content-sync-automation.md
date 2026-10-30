# Canonical content synchronization rollout

## Initial implementation status

Stage 1 implementation added on dev: owner-only `GET /api/content-sync/audit` previews every packaged canonical batch in one REPEATABLE_READ transaction. It never applies content or writes a baseline. The report identifies source bytes by a deterministic manifest digest and returns classifications and field names without before/after payloads. Validation and live read-only reconciliation must pass before Stage 1 is complete.

At this initial stage no production synchronization baseline existed. The 2026-10-29 Java import covered 145 Concepts only, not Question files. Never mark the entire repository synchronized based on that import; current evidence is recorded below.

## Original ordered gates

1. Validate audit code, verify owner/anonymous access behavior, deploy the diagnostic path, run the full read-only production reconciliation, and review all Question differences. Record the source SHA, manifest digest and scoped result. Do not auto-apply this initial reconciliation.
2. Add JPA-backed run/batch ledger, fixed source manifest, delta planning from last fully successful baseline, shared locking for manual/automatic imports, and transactional stale-preview checks. Revalidate successful batches on retry; never advance the global baseline after partial failure. Deletion, identity changes, unexpected creation and unsupported Question edits must block.
3. Add a non-web Cloud Run Job entry point using the existing JPA Import services and production secret references. Keep production apply disabled. Verify exact image digest, source SHA, target identity and minimum IAM; do not launch a local-profile production server or expose a public automation endpoint.
4. Enable concept synchronization only after deployed frontend compatibility and backend SHA checks, recoverability verification, and isolated concurrency/failure/history tests. Serialize releases; Actions concurrency alone is insufficient. Default stop behavior is to retain batch evidence, not restore the database.
5. Expand Question policy only after preserving historical Attempt meaning. Existing-attempt answer/choice/type/concept-link changes are blocked by default. Do not silently reinterpret old answers or assume ID preservation alone preserves semantics.

## Acceptance criteria

- Failed/skipped CI run between two source commits does not lose earlier content changes.
- Source file deletion, path traversal, key changes and duplicate definitions block.
- Preview/Apply race and simultaneous manual import block or serialize safely.
- Partial failure and lost response after commit converge by re-preview without duplicate writes.
- Existing canonical IDs and all personal/history relations remain stable.
- Production activity during synchronization is distinguished from importer writes; whole-table digest equality is meaningful only without concurrent user activity.
- New visualization types wait for a compatible frontend deployment.
- Failed synchronization does not advance checkpoint or trigger full production DB restoration.

## Recovery

Recheck Neon history coverage at execution time. A historical snapshot is not a fresh backup. Never delete an existing snapshot or upgrade a plan automatically. PITR restoration is not a routine automatic rollback: it can remove newer personal records. Prefer reviewed canonical-only compensation with conflict detection and retained before-images. Keep original source and committed batch outcomes for investigation.

## Current implementation update

- The engine uses one transaction for the entire bounded scope, including all Import batches, the success run record and checkpoint. This deliberately replaces partial-commit/resume with atomic rollback plus exact re-preview. Existing source identities cannot disappear; source changes are preflighted even when the source manifest says the file is unchanged.
- Manual Apply and automatic Apply acquire `content_import_lock` before analyzing. Attempt creation uses the same lock before persistence so it cannot race Question history checks. Keep all future canonical writers on this guard.
- Supported scopes are `ALL_TOPICS`, `ALL_CONCEPTS`, and `ALL_QUESTIONS`, plus the legacy Java scopes. Topic and Concept initialization may reconcile only fields allowed by `ContentSyncPolicy`; unsafe structural, identity, status, or relationship drift blocks the entire transaction. Question initialization records every canonical question, reconciles items without personal history, and defers history-bearing questions with their existing records untouched. After initialization, automatic Question updates are limited to eligible prompt/explanation text changes. No content deletion is performed.
- Concept relationship/status edits, Question structure edits, all attempted-Question edits, shared Reference metadata edits, deletes/moves, and identity replacement block auto-apply.
- The non-web Job uses packaged source SHA and file bytes, validates target host/database, and disables Flyway. Deploy/migrate the serving application normally before running the Job. Audit produces safe field-name-only JSON. Failure exits nonzero; failed work has no committed checkpoint or content changes. Job execution logs retain failed execution evidence; the DB ledger contains only committed success outcomes.
- Production writes require the protected `production-content-sync` environment, a successful fresh recovery check, exact production backend/frontend SHA checks, and repository variable `CSFORGE_CONTENT_SYNC_DB_ROLE_READY=true`. Release-triggered synchronization additionally requires repository variables `CSFORGE_CONTENT_SYNC_ENABLED=true` and `CSFORGE_AUTO_CONTENT_SYNC_ENABLED=true`. Questions remain behind repository variable `CSFORGE_ALL_QUESTION_SYNC_ENABLED=true`. Missing variables fail closed. Manual `AUDIT` and `RECOVERY_CHECK` remain read-only and available while the database role is not ready.
- The execution script checks actual Cloud Run 100% revision digest and the actual production frontend `build-info.json` before write modes. It shares release concurrency with backend deployment. It accepts only the latest main SHA for write modes.
- Before every write execution, the workflow reads the fixed Neon project's history retention, verifies the branch identity/state and retrieves the canonical schema at five minutes before execution through Neon's read-only API. Only after those checks does it generate the timestamp consumed by the Job (valid for 15 minutes). Configure `NEON_API_KEY` as a protected environment secret; no manually supplied timestamp or static repository variable is accepted. Provider errors block application. This verifies live retention and historical readability, not a completed restore drill or a guarantee that all retained data can be restored.

### Activation sequence

1. Merge the reviewed `dev` change through the normal PR path. Automatic writes stay blocked by the new role-readiness and auto-sync gates during deployment.
2. Set a password for the Production `csforge_content_sync` role in Neon, store that same secret value under `csforge-content-sync-db-password` in Secret Manager, and grant only the runtime service account access to that secret. Do not send the password through chat or GitHub.
3. Run a read-only `AUDIT` from the deployed image. Confirm the Job has the restricted username and secret reference, the connection succeeds as `csforge_content_sync`, its grants match `sync-role-grants.sql`, and the output reports source manifest and drift counts for all three global scopes.
4. After the audit succeeds, set repository variable `CSFORGE_CONTENT_SYNC_DB_ROLE_READY=true`. Run `INITIALIZE` for `ALL_TOPICS`, `ALL_CONCEPTS`, and `ALL_QUESTIONS`. Topic/Concept initialization applies only policy-approved canonical fields; Question initialization defers history-bearing questions. Review the committed run evidence, counts and manifest SHA for each scope.
5. Set repository variable `CSFORGE_ALL_QUESTION_SYNC_ENABLED=true` only after the `ALL_QUESTIONS` checkpoint exists and deferred/history counts have been reviewed. Then set repository variable `CSFORGE_AUTO_CONTENT_SYNC_ENABLED=true` to enable release-triggered sync for Topics, Concepts and Questions. Keep `CSFORGE_CONTENT_SYNC_ENABLED=true` as the existing top-level release switch. `RECOVERY_CHECK` remains read-only.

### Activation evidence (2026-10-30 KST)

- PR #282 was merged as `c914b50c599c3e9d831beef53b0800d64ace9f29`. The deployment workflow built its image but left 100% of Cloud Run traffic pinned to old revision `csforge-00089-6kj`; its health check passed against the old revision. The missing audit endpoint was therefore a deployment routing issue, not evidence that the new image lacked the controller.
- New revision `csforge-00090-v22` was independently tested through a zero-traffic candidate tag. It applied Flyway V17, reported readiness and DB UP, and was promoted to 100%. The audit endpoint subsequently succeeded with 876 source files, 60 updates and zero errors. All 59 Java differences are Questions; Java Concepts have no differences. This does not imply all other content is synchronized.
- The new deployment workflow tests the candidate image digest and readiness, checks main has not advanced, explicitly promotes that revision, and checks the resulting traffic. The regression tests exercise failed health, wrong image, stale main and unexpected traffic.
- An isolated production-derived branch accepted V17 DDL with unchanged personal/history table digests. The production migration is now independently confirmed by Flyway logs. Do not restore production wholesale: later personal activity must be preserved.
- The protected `production-content-sync` environment permits main only and contains the user-supplied `NEON_API_KEY`. Dedicated runtime/executor identities, Job and IAM bindings have been provisioned. The Production database now has a `csforge_content_sync` role with only canonical-content writes and the `question_id` reads required to protect history; it cannot log in, read Concept progress, or alter personal records. The Cloud Run Job still uses the existing database-owner credential until the restricted login password is entered into Neon and Secret Manager and the Job is verified against it. Keep all-area and Question automation gated until that runtime switch is confirmed.
- The protected workflow verified the production branch's six-hour history retention and a schema read from five minutes earlier. This is not a complete restore drill. The Java Concept checkpoint was initialized at SHA `2f7831632f1cae10078a52739787a4e71a33faaf` with 145 unchanged Concepts, zero created and zero updated. A subsequent guarded Apply of the same SHA also succeeded with zero changes. The repository variable `CSFORGE_CONTENT_SYNC_ENABLED` is true.
- The provisioned Job successfully ran a read-only audit from the production image, reporting zero audit errors and Java Concept manifest `77e49f516091c3e73ad32455b7210d1aaa324700e4187253cf7dab7cceeabafd`. The executor trusts the immutable owner/repository ID OIDC subject for the protected environment.
- Manual `RECOVERY_CHECK` verifies the protected Neon secret and history while the automatic switch is off. It does not invoke the Job or write the database.

### Staged Java Question reconciliation

- `QUESTION_PLAN` is a manually dispatched, read-only Job in `JAVA_QUESTIONS` scope. It selects only existing Questions whose differences are limited to prompt/explanation text and that have no Attempt, quiz membership, wrong note, review schedule, or review history. It records source, preview and selection digests plus the candidate count; it does not emit the Question keys or user answers.
- `QUESTION_APPLY` is separately gated by `SYNC_QUESTION_RECONCILE_ENABLED` on the Job and is not triggered by a release. Supply the exact four values from a reviewed plan. The Job rechecks frontend/backend/source identity, fresh recovery evidence, the candidate digest and the preview while holding the import/quiz/review-scheduling lock. Any change to source, DB state, or candidate set blocks the transaction.
- Apply reconstructs inputs containing only selected Questions, validates each against the existing history policy, commits all selected updates atomically, re-previews them, and records a partial run. It does not advance the `JAVA_QUESTIONS` checkpoint. Structural edits and Questions with Attempts remain blocked. Disable the separate Job flag after the reviewed reconciliation.
- This remains an incremental tool for the legacy Java-only scope. The global `ALL_QUESTIONS` checkpoint is initialized by `QuestionContentSyncService`: it records each question's source and database fingerprints, reconciles questions without personal history, and marks history-bearing differences as deferred. Later automatic updates are limited to prompt/explanation text and questions with no personal history. Failed or stale runs require a new plan, not a production restore.

### Restricted Production database login

- The `csforge_content_sync` role is created as `NOLOGIN` and has been verified on the Production branch. Its grants cover canonical Topic, Concept, Reference, and Question data; synchronization metadata; and only the `question_id` columns needed to identify protected history. It has no SELECT on `concept_progress`, no Question DELETE, and no write privileges on personal or history tables.
- The release workflow pins the Job username to `csforge_content_sync` and updates only the Secret Manager reference for `DB_PASSWORD`. The workflow cannot switch the Job until the secret has an enabled version. Never put the password in GitHub Actions variables, workflow inputs, or shell arguments.
- Do not set repository variable `CSFORGE_CONTENT_SYNC_DB_ROLE_READY` until the read-only production audit proves the Job connected with that role and the grants are verified. Do not set the automatic sync gate until all three scope checkpoints and the Question history review are complete.

### Preserving personal data during recovery

1. Keep synchronization disabled while investigating an unsuccessful execution. Read the execution logs and the last committed scoped checkpoint; failed transactions have no content or checkpoint changes.
2. Re-preview the packaged source of the last successful run. Use stable keys and existing Import upserts for reviewed canonical-only compensation; never delete and recreate Concepts or Questions.
3. Before compensating Questions, inspect current Attempts again. Do not restore an answer/choice/type/relationship over later personal history. Resolve those changes explicitly through a separately reviewed content revision.
4. Do not automatically restore the entire production branch to a historical time. That could discard learning records created after the restore point. If PITR is needed for investigation, restore to an isolated branch and compare canonical records before deciding on compensation.
