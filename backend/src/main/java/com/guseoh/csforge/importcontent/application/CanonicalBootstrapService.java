package com.guseoh.csforge.importcontent.application;

import java.util.ArrayList;
import java.util.List;

import com.guseoh.csforge.learning.domain.ConceptRepository;
import com.guseoh.csforge.learning.domain.LearningAreaRepository;
import com.guseoh.csforge.learning.domain.TopicRepository;
import com.guseoh.csforge.question.domain.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** canonical pack을 기존 import preview/apply 계약으로 명시적으로 PostgreSQL에 준비한다. */
@Service
@RequiredArgsConstructor
public class CanonicalBootstrapService {
    private final CanonicalContentSource contentSource;
    private final CanonicalBootstrapBatchPlanner batchPlanner;
    private final ContentImportPreviewService previewService;
    private final ContentImportApplyService applyService;
    private final LearningAreaRepository learningAreaRepository;
    private final TopicRepository topicRepository;
    private final ConceptRepository conceptRepository;
    private final QuestionRepository questionRepository;

    @Transactional(readOnly = true)
    public CanonicalBootstrapStatusView status() {
        CanonicalBootstrapPlan plan = plan();
        List<ImportPreviewResult> previews = preview(plan);
        CanonicalBootstrapCounts current = currentCounts();
        return new CanonicalBootstrapStatusView(state(previews, current), plan.sourceFileCount(), plan.batches().size(),
                readyBatchCount(previews), plan.totalItemCount(), plan.topicCount(), plan.conceptCount(),
                plan.questionCount(), current);
    }

    public CanonicalBootstrapExecutionResult bootstrap() {
        CanonicalBootstrapPlan plan = plan();
        CanonicalBootstrapTotals totals = new CanonicalBootstrapTotals(0, 0, 0, 0, 0, 0);
        int completed = 0;
        for (CanonicalBootstrapBatch batch : plan.batches()) {
            ImportPreviewResult preview;
            try {
                preview = previewService.preview(batch.command());
            } catch (RuntimeException exception) {
                return failed(plan, completed, totals.withFailed(), batch, message(exception));
            }
            if (!preview.canApply()) {
                return failed(plan, completed, totals.withErrors(preview.errors()).withFailed(), batch,
                        "Bootstrap preview contains validation errors");
            }
            try {
                ImportApplyResult applied = applyService.apply(batch.command(), preview.previewDigest());
                totals = totals.add(applied);
                completed++;
            } catch (RuntimeException exception) {
                return failed(plan, completed, totals.withFailed(), batch, message(exception));
            }
        }
        return new CanonicalBootstrapExecutionResult(true, CanonicalBootstrapState.READY, plan.sourceFileCount(),
                plan.batches().size(), completed, plan.totalItemCount(), null, null, null, totals, currentCounts());
    }

    private CanonicalBootstrapPlan plan() {
        List<CanonicalContentFile> files = contentSource.load();
        if (files.isEmpty()) throw new CanonicalContentSourceException("Canonical content pack is empty");
        return batchPlanner.plan(files);
    }

    private List<ImportPreviewResult> preview(CanonicalBootstrapPlan plan) {
        List<ImportPreviewResult> result = new ArrayList<>();
        for (CanonicalBootstrapBatch batch : plan.batches()) {
            result.add(previewService.preview(batch.command()));
        }
        return result;
    }

    private CanonicalBootstrapExecutionResult failed(CanonicalBootstrapPlan plan, int completed,
            CanonicalBootstrapTotals totals, CanonicalBootstrapBatch batch, String message) {
        CanonicalBootstrapCounts current = currentCounts();
        return new CanonicalBootstrapExecutionResult(false, stateForCurrentCounts(current), plan.sourceFileCount(),
                plan.batches().size(), completed, plan.totalItemCount(), batch.sequence(), batch.kind(), message,
                totals, current);
    }

    private static String message(RuntimeException exception) {
        return exception.getMessage() == null ? "Bootstrap batch failed" : exception.getMessage();
    }

    private CanonicalBootstrapState state(List<ImportPreviewResult> previews, CanonicalBootstrapCounts current) {
        boolean ready = previews.stream().allMatch(this::isReady);
        if (ready) return CanonicalBootstrapState.READY;
        return stateForCurrentCounts(current);
    }

    private boolean isReady(ImportPreviewResult preview) {
        return preview.canApply() && preview.items().stream()
                .allMatch(item -> item.classification() == ImportClassification.UNCHANGED);
    }

    private static CanonicalBootstrapState stateForCurrentCounts(CanonicalBootstrapCounts current) {
        return current.topics() == 0 && current.concepts() == 0 && current.questions() == 0
                ? CanonicalBootstrapState.EMPTY : CanonicalBootstrapState.PARTIAL;
    }

    private static int readyBatchCount(List<ImportPreviewResult> previews) {
        return Math.toIntExact(previews.stream().filter(preview -> preview.canApply()
                && preview.items().stream().allMatch(item -> item.classification() == ImportClassification.UNCHANGED)).count());
    }

    private CanonicalBootstrapCounts currentCounts() {
        return new CanonicalBootstrapCounts(learningAreaRepository.count(), topicRepository.count(), conceptRepository.count(), questionRepository.count());
    }
}
