# Canonical content synchronization rollout

## Implementation status

Stage 1 implementation added on dev: owner-only `GET /api/content-sync/audit` previews every packaged canonical batch in one REPEATABLE_READ transaction. It never applies content or writes a baseline. The report identifies source bytes by a deterministic manifest digest and returns classifications and field names without before/after payloads. Validation and live read-only reconciliation must pass before Stage 1 is complete.

No production synchronization baseline exists yet. The 2026-10-29 Java import covered 145 Concepts only, not Question files. Never mark the entire repository synchronized based on that import.

## Remaining ordered gates

1. Validate audit code, verify owner/anonymous access behavior, deploy the diagnostic path, run the full read-only production reconciliation, and review all Question differences. Record the source SHA, manifest digest and scoped result. Do not auto-apply this initial reconciliation.
2. Add JPA-backed run/batch ledger, fixed source manifest, delta planning from last fully successful baseline, shared locking for manual/automatic imports, and transactional stale-preview checks. Revalidate successful batches on retry; never advance the global baseline after partial failure. Deletion, identity changes, unexpected creation and unsupported Question edits must block.
3. Add a non-web Cloud Run Job entry point using the existing JPA Import services and production secret references. Keep production apply disabled. Verify exact image digest, source SHA, target identity and minimum IAM; do not launch a local-profile production server or expose a public automation endpoint.
4. Enable concept synchronization only after deployed frontend compatibility and backend SHA checks, recoverability verification, and isolated concurrency/failure/history tests. Serialize releases; Actions concurrency alone is insufficient. Default stop behavior is to retain batch evidence, not restore the database.
5. Expand Question policy only after preserving historical Attempt meaning. Existing-attempt answer/choice/type/concept-link changes are blocked by default. Do not silently reinterpret old answers or assume ID preservation alone preserves semantics.

## Acceptance tests still required

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
