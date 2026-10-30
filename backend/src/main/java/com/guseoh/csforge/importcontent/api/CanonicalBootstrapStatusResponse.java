package com.guseoh.csforge.importcontent.api;

/** canonical bootstrap 준비 상태 API 응답이다. */
public record CanonicalBootstrapStatusResponse(String state, int sourceFileCount, int totalBatches,
        int readyBatches, int totalItems, CanonicalBootstrapItemsResponse canonicalItems,
        CanonicalBootstrapCountsResponse currentCounts) {
}
