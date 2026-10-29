package com.guseoh.csforge.importcontent.sync;

import com.guseoh.csforge.importcontent.application.*;
import com.guseoh.csforge.importcontent.domain.*;
import java.time.Clock;
import java.time.Instant;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

/** 제한된 scope 전체를 원자적으로 검증·반영하여 부분 checkpoint와 중복 재시도를 방지한다. */
@Service
@RequiredArgsConstructor
public class ContentSyncService {
    private final CanonicalContentSource source;
    private final CanonicalBootstrapBatchPlanner batches;
    private final ContentSyncPlanner planner;
    private final ContentImportAnalyzer analyzer;
    private final ContentImportApplyService apply;
    private final ContentImportGuard guard;
    private final ContentSyncPolicy policy;
    private final ContentSyncCheckpointRepository checkpoints;
    private final ContentSyncRunRepository runs;
    private final ObjectMapper json;
    private final Clock clock;

    @Transactional
    public ContentSyncResult synchronize(ContentSyncScope scope, String sha, String expectedBaseline,
            String expectedManifest, boolean initialize) {
        if (sha == null || !sha.matches("[0-9a-f]{40}")) throw new IllegalArgumentException("Full source SHA required");
        guard.acquire();
        var files = source.load().stream().filter(f -> scope.includes(f.path())).toList();
        var manifest = planner.manifest(files);
        String digest = ContentSyncAuditDigest.calculate(files);
        if (!digest.equals(expectedManifest)) throw new IllegalStateException("Source manifest mismatch");
        var checkpoint = checkpoints.findById(scope.name());
        if (initialize && checkpoint.isPresent()) throw new IllegalStateException("Baseline already exists");
        if (!initialize && (checkpoint.isEmpty() || !checkpoint.get().getSourceSha().equals(expectedBaseline)))
            throw new IllegalStateException("Baseline lease mismatch; re-plan from last successful checkpoint");
        var previous = initialize ? new ContentSyncManifest(Map.of())
                : json.readValue(checkpoint.orElseThrow().getManifest(), ContentSyncManifest.class);
        var changed = initialize ? Set.<String>of() : planner.changed(previous, manifest);
        var existingKeys = previous.files().values().stream().flatMap(e -> e.identities().stream()).collect(java.util.stream.Collectors.toSet());
        int updated = 0, created = 0, unchanged = 0;
        var plan = batches.plan(files);
        // Preflight every file, including unchanged source files: DB-only drift must not be silently ignored.
        for (var batch : plan.batches()) {
            var analysis = analyzer.analyze(batch.command());
            policy.validate(analysis, scope);
            for (var item : analysis.previews()) {
                if (item.classification() == ImportClassification.CREATED
                        && existingKeys.contains(item.kind() + ":" + item.contentKey()))
                    throw new IllegalStateException("Previously synchronized identity missing from DB: " + item.contentKey());
                if (item.classification() != ImportClassification.UNCHANGED
                        && (initialize || !changed.contains(item.fileName())))
                    throw new IllegalStateException("Unreviewed baseline drift: " + item.contentKey());
            }
        }
        if (!initialize && !changed.isEmpty()) {
            var delta = batches.plan(files.stream().filter(f -> changed.contains(f.path())).toList());
            for (var batch : delta.batches()) {
                var analysis = analyzer.analyze(batch.command());
                policy.validate(analysis, scope);
                var result = apply.apply(batch.command(), analysis.digest());
                updated += result.updated(); created += result.created();
            }
        }
        for (var batch : plan.batches()) {
            var verification = analyzer.analyze(batch.command());
            if (verification.previews().stream().anyMatch(p -> p.classification() != ImportClassification.UNCHANGED))
                throw new IllegalStateException("Post-apply reconciliation failed");
            unchanged += verification.previews().size();
        }
        String encoded = json.writeValueAsString(manifest);
        var target = checkpoint.orElseGet(() -> ContentSyncCheckpoint.establish(scope.name(), sha, encoded));
        target.advance(sha, encoded);
        checkpoints.save(target);
        String mode = initialize ? "INITIALIZE" : "APPLY";
        runs.save(ContentSyncRun.completed(scope.name(), sha, digest, mode, changed.size(), updated, created, Instant.now(clock)));
        return new ContentSyncResult(scope.name(), sha, digest, mode, changed.size(), updated, created, unchanged);
    }
}
