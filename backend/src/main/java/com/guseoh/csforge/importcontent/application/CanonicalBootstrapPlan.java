package com.guseoh.csforge.importcontent.application;

import java.util.List;

/** canonical source를 실행할 순서와 batch별 item 합계로 표현한 계획이다. */
public record CanonicalBootstrapPlan(List<CanonicalBootstrapBatch> batches, int sourceFileCount,
        int topicCount, int conceptCount, int questionCount, int totalItemCount) {
    public CanonicalBootstrapPlan {
        batches = List.copyOf(batches);
    }
}
