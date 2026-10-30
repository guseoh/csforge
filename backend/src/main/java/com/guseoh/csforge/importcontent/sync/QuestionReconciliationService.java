package com.guseoh.csforge.importcontent.sync;

import com.guseoh.csforge.importcontent.application.*;
import com.guseoh.csforge.importcontent.domain.ContentSyncRun;
import com.guseoh.csforge.importcontent.domain.ContentSyncRunRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Set;
import java.time.Clock;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

/** 명시적으로 선택한 이력 없는 문항의 텍스트 변경만 검증하고 원자적으로 반영한다. */
@Service
@RequiredArgsConstructor
public class QuestionReconciliationService {
    private final CanonicalContentSource source;
    private final QuestionImportSelection selection;
    private final ContentImportAnalyzer analyzer;
    private final ContentImportApplyService apply;
    private final ContentImportGuard guard;
    private final ContentSyncPolicy policy;
    private final CanonicalBootstrapBatchPlanner batches;
    private final ContentSyncRunRepository runs;
    private final Clock clock;
    private final QuestionPersonalHistory personalHistory;
    private final ContentSyncPlanner planner;

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public QuestionCandidatePlan planCandidates() {
        var files = questionFiles();
        return plan(files, candidates(files));
    }

    /** 자동 실행도 같은 잠금 안에서 후보를 다시 평가하며, 후보가 없으면 아무것도 변경하지 않는다. */
    @Transactional
    public java.util.Optional<ImportApplyResult> applyAutomaticCandidates(String sourceSha) {
        guard.acquire();
        var files = questionFiles();
        var keys = candidates(files);
        if (keys.isEmpty()) return java.util.Optional.empty();
        return java.util.Optional.of(applyCandidates(plan(files, keys), sourceSha));
    }

    /** 각 배치의 안전 후보만 반영하며 모든 배치를 하나의 트랜잭션으로 묶는다. */
    @Transactional
    public int applyAllAutomaticCandidates(String sourceSha) {
        if (sourceSha == null || !sourceSha.matches("[0-9a-f]{40}"))
            throw new IllegalArgumentException("Full source SHA required");
        guard.acquire();
        var files = source.load().stream().filter(file -> ContentSyncScope.ALL_QUESTIONS.includes(file.path())).toList();
        // 전체 원본의 중복 키 및 경로 오류를 후보 선택 전에도 검증한다.
        planner.manifest(files);
        int updated = 0;
        int changedFiles = 0;
        for (var batch : batches.plan(files).batches()) {
            var batchFiles = batch.command().files().stream()
                    .map(file -> new CanonicalContentFile(file.fileName(), file.content())).toList();
            var keys = candidates(batchFiles);
            if (keys.isEmpty()) continue;
            var command = selection.select(batchFiles, keys, ContentSyncScope.ALL_QUESTIONS);
            var analysis = analyzer.analyze(command);
            validate(analysis, keys.size(), ContentSyncScope.ALL_QUESTIONS);
            var result = apply.apply(command, analysis.digest());
            var verification = analyzer.analyze(command);
            if (verification.previews().size() != keys.size()
                    || verification.previews().stream().anyMatch(item -> item.classification() != ImportClassification.UNCHANGED))
                throw new IllegalStateException("Selected Question reconciliation failed");
            updated += result.updated();
            changedFiles += (int) result.items().stream().filter(item -> item.classification() == ImportClassification.UPDATED)
                    .map(ImportItemPreview::fileName).distinct().count();
        }
        runs.save(ContentSyncRun.completed("ALL_QUESTIONS_PARTIAL", sourceSha, ContentSyncAuditDigest.calculate(files),
                "QUESTION_AUTO", changedFiles, updated, 0, Instant.now(clock)));
        return updated;
    }

    @Transactional
    public ImportApplyResult applyCandidates(QuestionCandidatePlan expected, String sourceSha) {
        if (sourceSha == null || !sourceSha.matches("[0-9a-f]{40}")) {
            throw new IllegalArgumentException("Full source SHA required");
        }
        guard.acquire();
        var files = questionFiles();
        var keys = candidates(files);
        var current = plan(files, keys);
        if (!current.equals(expected)) throw new IllegalStateException("Question candidate plan is stale");
        var result = apply(keys, current.sourceDigest(), current.previewDigest());
        int changedFiles = (int) result.items().stream()
                .filter(item -> item.classification() == ImportClassification.UPDATED)
                .map(ImportItemPreview::fileName).distinct().count();
        runs.save(ContentSyncRun.completed("JAVA_QUESTIONS_PARTIAL", sourceSha, current.sourceDigest(),
                "QUESTION_RECONCILE", changedFiles, result.updated(), result.created(), Instant.now(clock)));
        return result;
    }

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public QuestionReconciliationPreview preview(Set<String> keys) {
        var files = questionFiles();
        var command = selection.select(files, keys);
        var analysis = analyzer.analyze(command);
        validate(analysis, keys.size());
        return new QuestionReconciliationPreview(ContentSyncAuditDigest.calculate(files), analysis.digest(),
                keys.size(), Math.toIntExact(analysis.count(ImportClassification.UPDATED)),
                Math.toIntExact(analysis.count(ImportClassification.UNCHANGED)));
    }

    private ImportApplyResult apply(Set<String> keys, String sourceDigest, String previewDigest) {
        guard.acquire();
        var files = questionFiles();
        if (!ContentSyncAuditDigest.calculate(files).equals(sourceDigest)) {
            throw new IllegalStateException("Question source changed after preview");
        }
        var command = selection.select(files, keys);
        var analysis = analyzer.analyze(command);
        validate(analysis, keys.size());
        if (!analysis.digest().equals(previewDigest)) throw new ImportPreviewStaleException();
        var result = apply.apply(command, previewDigest);
        var verification = analyzer.analyze(command);
        if (verification.previews().size() != keys.size()
                || verification.previews().stream().anyMatch(item -> item.classification() != ImportClassification.UNCHANGED)) {
            throw new IllegalStateException("Selected Question reconciliation failed");
        }
        return result;
    }

    private void validate(ImportAnalysis analysis, int selected) {
        validate(analysis, selected, ContentSyncScope.JAVA_QUESTIONS);
    }

    private void validate(ImportAnalysis analysis, int selected, ContentSyncScope scope) {
        if (analysis.previews().size() != selected
                || analysis.previews().stream().anyMatch(item -> item.kind() != ImportItemKind.QUESTION
                || (item.classification() != ImportClassification.UPDATED
                && item.classification() != ImportClassification.UNCHANGED))) {
            throw new IllegalStateException("Selected Question requires manual review");
        }
        policy.validate(analysis, scope);
        var ids = analysis.state().questions().values().stream().map(question -> question.getId()).toList();
        if (!personalHistory.findQuestionIds(ids).isEmpty()) {
            throw new IllegalStateException("Question with personal history requires manual review");
        }
    }

    private List<CanonicalContentFile> questionFiles() {
        return source.load().stream().filter(file -> ContentSyncScope.JAVA_QUESTIONS.includes(file.path())).toList();
    }

    private Set<String> candidates(List<CanonicalContentFile> files) {
        java.util.Map<String, Long> candidates = new java.util.HashMap<>();
        for (var batch : batches.plan(files).batches()) {
            var analysis = analyzer.analyze(batch.command());
            if (analysis.hasErrors()) throw new IllegalStateException("Question analysis errors block reconciliation");
            for (var item : analysis.previews()) {
                if (policy.isSafeQuestionUpdate(analysis, item)) {
                    var question = analysis.state().questions().get(item.contentKey());
                    if (candidates.putIfAbsent(item.contentKey(), question.getId()) != null) {
                        throw new IllegalStateException("Duplicate candidate identity");
                    }
                }
            }
        }
        var protectedIds = personalHistory.findQuestionIds(candidates.values());
        candidates.values().removeIf(protectedIds::contains);
        return Set.copyOf(candidates.keySet());
    }

    private QuestionCandidatePlan plan(List<CanonicalContentFile> files, Set<String> keys) {
        if (keys.isEmpty()) throw new IllegalStateException("No eligible Question changes");
        var analysis = analyzer.analyze(selection.select(files, keys));
        validate(analysis, keys.size());
        return new QuestionCandidatePlan(ContentSyncAuditDigest.calculate(files), analysis.digest(),
                selectionDigest(keys), keys.size());
    }

    private static String selectionDigest(Set<String> keys) {
        try {
            var digest = MessageDigest.getInstance("SHA-256");
            keys.stream().sorted().forEach(key -> {
                digest.update(key.getBytes(StandardCharsets.UTF_8));
                digest.update((byte) 0);
            });
            return HexFormat.of().formatHex(digest.digest());
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 unavailable", exception);
        }
    }
}
