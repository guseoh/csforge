package com.guseoh.csforge.review.domain;

import java.time.Instant;

/**
 * 복습 일정이 한 번의 finalized Attempt로 전이한 결과이다.
 */
public record ReviewTransition(
        ReviewResult result,
        int stageBefore,
        Integer stageAfter,
        Instant reviewedAt,
        Instant nextDueAt,
        boolean processed) {
}
