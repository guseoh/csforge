package com.guseoh.csforge.search.application;

/** Search 제품 상태와 recovery 판단에 필요한 최소 진단 정보이다. */
public record SearchStatusView(
        SearchProductState state,
        long indexedDocuments,
        long pendingOutboxEvents) {
}
