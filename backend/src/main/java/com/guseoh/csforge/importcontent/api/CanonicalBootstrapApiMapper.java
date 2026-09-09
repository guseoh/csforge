package com.guseoh.csforge.importcontent.api;

import com.guseoh.csforge.importcontent.application.CanonicalBootstrapCounts;
import com.guseoh.csforge.importcontent.application.CanonicalBootstrapExecutionResult;
import com.guseoh.csforge.importcontent.application.CanonicalBootstrapStatusView;
import com.guseoh.csforge.importcontent.application.CanonicalBootstrapTotals;
import org.springframework.stereotype.Component;

/** bootstrap application 결과를 HTTP 응답 계약으로 변환한다. */
@Component
public class CanonicalBootstrapApiMapper {
    public CanonicalBootstrapStatusResponse toStatus(CanonicalBootstrapStatusView view) {
        return new CanonicalBootstrapStatusResponse(view.state().name(), view.sourceFileCount(), view.totalBatches(),
                view.readyBatches(), view.totalItems(), new CanonicalBootstrapItemsResponse(view.canonicalTopicCount(),
                view.canonicalConceptCount(), view.canonicalQuestionCount()), toCounts(view.currentCounts()));
    }

    public CanonicalBootstrapResponse toExecution(CanonicalBootstrapExecutionResult result) {
        return new CanonicalBootstrapResponse(result.success(), result.state().name(), result.sourceFileCount(),
                result.totalBatches(), result.completedBatches(), result.totalItems(), result.failedBatch(),
                result.failedKind() == null ? null : result.failedKind().name(), result.failureMessage(),
                toTotals(result.totals()), toCounts(result.currentCounts()));
    }

    private static CanonicalBootstrapCountsResponse toCounts(CanonicalBootstrapCounts counts) {
        return new CanonicalBootstrapCountsResponse(counts.learningAreas(), counts.topics(), counts.concepts(), counts.questions());
    }

    private static CanonicalBootstrapTotalsResponse toTotals(CanonicalBootstrapTotals totals) {
        return new CanonicalBootstrapTotalsResponse(totals.created(), totals.updated(), totals.unchanged(), totals.skipped(), totals.errors(), totals.failed());
    }
}
