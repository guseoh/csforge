package com.guseoh.csforge.importcontent.api;

/** 명시적 canonical bootstrap 실행 결과 API 응답이다. */
public record CanonicalBootstrapResponse(boolean success, String state, int sourceFileCount, int totalBatches,
        int completedBatches, int totalItems, Integer failedBatch, String failedKind, String failureMessage,
        CanonicalBootstrapTotalsResponse totals, CanonicalBootstrapCountsResponse currentCounts) {
}
