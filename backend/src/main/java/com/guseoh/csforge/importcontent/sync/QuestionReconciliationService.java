package com.guseoh.csforge.importcontent.sync;

import com.guseoh.csforge.importcontent.application.*;
import java.util.Set;
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

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public QuestionReconciliationPreview preview(Set<String> keys) {
        var files = source.load().stream().filter(file -> ContentSyncScope.JAVA_QUESTIONS.includes(file.path())).toList();
        var command = selection.select(files, keys);
        var analysis = analyzer.analyze(command);
        validate(analysis, keys.size());
        return new QuestionReconciliationPreview(ContentSyncAuditDigest.calculate(files), analysis.digest(),
                keys.size(), Math.toIntExact(analysis.count(ImportClassification.UPDATED)),
                Math.toIntExact(analysis.count(ImportClassification.UNCHANGED)));
    }

    @Transactional
    public ImportApplyResult apply(Set<String> keys, String sourceDigest, String previewDigest) {
        guard.acquire();
        var files = source.load().stream().filter(file -> ContentSyncScope.JAVA_QUESTIONS.includes(file.path())).toList();
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
        if (analysis.previews().size() != selected
                || analysis.previews().stream().anyMatch(item -> item.kind() != ImportItemKind.QUESTION
                || (item.classification() != ImportClassification.UPDATED
                && item.classification() != ImportClassification.UNCHANGED))) {
            throw new IllegalStateException("Selected Question requires manual review");
        }
        policy.validate(analysis, ContentSyncScope.JAVA_QUESTIONS);
    }
}
