package com.guseoh.csforge.importcontent.application;

/** canonical pack과 PostgreSQL 상태를 비교한 application 결과이다. */
public record CanonicalBootstrapStatusView(CanonicalBootstrapState state, int sourceFileCount, int totalBatches,
        int readyBatches, int totalItems, int canonicalTopicCount, int canonicalConceptCount,
        int canonicalQuestionCount, CanonicalBootstrapCounts currentCounts) {
}
