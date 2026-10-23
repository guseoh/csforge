# Issue #270 Production DB pre-deployment baseline

점검·기록 시각: 2026-10-23 19:33 Asia/Seoul  
Repository: guseoh/csforge  
Local branch: refactor (the .git/HEAD reference is refs/heads/refactor)

## 대상과 연결 정합성

- Neon organization: guseoh (org ID org-tiny-snow-74147195)
- Neon project: csForge (project ID blue-rice-17834735), AWS Asia Pacific 1 (Singapore)
- Branch: production (branch ID br-billowing-fog-b3myvics), default branch
- Compute endpoint: ep-orange-voice-b3u0nln6
- Cloud Run csforge (GCP project csforge-508510, region asia-southeast1) DB_URL endpoint ID was read in memory and matched the Neon Compute endpoint exactly. No connection string, user, or password was recorded.
- Before the first query the SQL Editor displayed Primary Idle/Ready to connect; connecting to run the SELECTs moved the Compute to ACTIVE. It remained active at the end of the check. No compute settings were changed.
- Accessible Neon inventory: current account lists one organization and one project. The project has production and issue-270-staging branches. Staging endpoint ep-hidden-fog-b3ia2s5l is separate and was not the Cloud Run target.

## Read-only Flyway result

Database: neondb.

- Latest successful migration: V16, rank 16, description “bookmark categories”.
- Migration rows: 16 total, 16 successful, 0 failed.
- All 16 recorded rows in public.flyway_schema_history have success = true. Latest recorded installed_on value: 2026-10-22 08:54:49.825822 (as returned by PostgreSQL).

## Pre-deploy row-count baseline

Counts are exact COUNT(*) aggregates from public tables; no user-level rows or values were selected.

| Table | Rows |
|---|---:|
| learning_area | 15 |
| topic | 134 |
| concept | 727 |
| question | 2,549 |
| concept_progress | 48 |
| concept_view_history | 97 |
| personal_note | 0 |
| quiz_session | 39 |
| attempt | 316 |
| wrong_note | 32 |
| review_schedule | 32 |
| review_history | 0 |
| bookmark_category | 3 |
| bookmark_category_concept | 0 |
| wrong_answer_analysis | 0 |

Cross-check: topic + concept + question = 3,410, consistent with the canonical-content aggregate referenced in the existing Issue #270 report. These counts are the pre-deployment reference for a later post-deployment comparison; they are not a before/after drift test.

## Recovery configuration and limits

- PITR/history window: 6 hours. At 19:33 KST the UI reported earliest restorable time 2026-10-23 13:33 KST.
- Manual snapshot: one snapshot, 2026-10-20 02:44:28 UTC, 51.27 MB, expires never. No recurring snapshot schedule is configured.
- PITR is limited to the rolling 6-hour window. The older manual snapshot restores only its captured point and does not fill the interval between that snapshot and the PITR window. No restore preview, restore, or new branch was initiated, so restore execution is not tested.

## Query scope and change boundary

Executed four read-only SELECT queries: public base-table inventory; Flyway success/failure summary plus recent migration metadata; COUNT(*) for the 15 listed tables; and a JSON aggregate recheck of the same counts to validate result-cell mapping. No INSERT, UPDATE, DELETE, DDL, Flyway migrate/repair/baseline, or restore was performed. No individual application rows or field values were fetched; application tables were accessed only through aggregate COUNT(*) results. DB_URL was not changed. No deploy or merge was performed.

## Release gate snapshot (rechecked 2026-10-23 19:52 KST)

PR #271 remains open from `refactor` to `main`, with 87 commits and 66 changed files. Current PR HEAD is `cd3870e`. GitHub Repository Validation `push` and `pull_request` jobs succeeded; their Cloud Run deployment jobs were skipped on `refactor`. Vercel Preview Comments passed with 0 unresolved feedback. The PR preview is not end-to-end evidence: the earlier release-validation record reports `/api/auth/session` and `/api/public/learning-areas` returning 401 from the old backend, and real Google OAuth has not been verified.

Issue #270's approved single-owner policy remains unchanged. The release plan is to verify actual OAuth and functionality **after Production deployment**; a separate non-production environment, new database, Cloud Run service, or OAuth test client is not a prerequisite and must not be created for this release. No merge or deployment is authorized by this baseline.

## Backend-first Production sequence (proposed; not executed)

- Cloud Run service `csforge` is healthy and currently routes 100% traffic to `csforge-00086-cj2`. The immediately prior `csforge-00085-zt6` revision is present at 0% traffic and has a successful status indicator in the version table; verify its health again before treating it as a rollback target. No traffic was changed.
- Vercel project `csforge` tracks `main` as its Production branch. Current Production deployment `b52e0c7` is Ready on `csforge-five.vercel.app`; the preceding Production deployment `2305296` is also Ready. The project overview exposes Instant Rollback. No rollback was performed.
- Vercel Production's `Auto-assign Custom Production Domains` setting is currently enabled. Its setting text says custom Production domains are assigned automatically after a merge to the Production branch or a Vercel CLI `--prod` deploy. To prevent the frontend domain moving before Cloud Run is ready, the proposed sequence is to temporarily disable this setting **after separate authorization**, merge only after explicit approval, let the backend deploy and verify it first, then manually promote the matching staged Vercel Production deployment. Restore the normal setting only after the planned live verification. No Vercel setting was changed.
- If code rollback is needed, first route Cloud Run traffic to a prior revision only after confirming that revision is healthy. For Vercel, use Instant Rollback to the immediate prior eligible Production deployment (currently `2305296`, to be confirmed in the UI before action). Vercel documents that Instant Rollback turns off automatic Production-domain assignment; restoring normal automatic behavior requires undoing the rollback or promoting another deployment. No rollback or domain change was performed.

Vercel procedure references: https://vercel.com/docs/deployments/promoting-a-deployment and https://vercel.com/docs/instant-rollback.

## Neon snapshot gate

At 19:52 KST the Production Backup & Restore page still showed one manual snapshot (`production`, 51.27 MB, never expires; the earlier exact capture time is 2026-10-20 02:44:28 UTC), no schedule, and a 6-hour PITR window. The page reported one snapshot created and presented `Upgrade for more snapshots`; it did not expose a create action for an additional snapshot. The existing snapshot is three days old and is not a fresh pre-deploy snapshot. Do not delete it, upgrade the plan, create a snapshot, restore, or create a branch as part of this inspection. Before any Production release, resolve snapshot capacity through an explicitly approved path, create the fresh snapshot immediately before release, and verify the snapshot row names `production`, shows a capture time after the preflight, and displays a usable expiry/restore option. Recheck the current PITR earliest time at that moment.

## Post-deployment acceptance and stop conditions

After the approved Production deployment, verify real Google OAuth for the allowed owner and the non-allowed-account denial path; confirm anonymous public Area/Topic/Concept/Compare/Search reads work without personal-data leakage or writes; confirm protected personal APIs remain 401 when logged out and owner-only Quiz/Result/Wrong Note/Review, notes, bookmarks, and progress work when logged in. Compare the canonical and personal/history table counts with the baseline above and investigate any unexpected change. If backend readiness or user-facing acceptance fails, stop the rollout and use the pre-verified Cloud Run and Vercel rollback paths; do not restore or otherwise modify Production database data without separate approval.

Merge and Production deployment remain blocked until a fresh snapshot can be created and verified, the backend-first Vercel domain-control procedure is separately approved and ready, the rollback candidates are revalidated, and the user gives separate explicit approval for merge/deployment. No snapshot, restore, data write, Vercel setting change, traffic change, merge, or deployment was performed during this update.
