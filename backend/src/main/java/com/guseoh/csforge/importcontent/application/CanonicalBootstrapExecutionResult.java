package com.guseoh.csforge.importcontent.application;

/** 명시적 canonical bootstrap 실행의 성공, partial failure, 재실행 정보를 표현한다. */
public record CanonicalBootstrapExecutionResult(boolean success, CanonicalBootstrapState state,
        int sourceFileCount, int totalBatches, int completedBatches, int totalItems,
        Integer failedBatch, ImportItemKind failedKind, String failureMessage,
        CanonicalBootstrapTotals totals, CanonicalBootstrapCounts currentCounts) {
}
