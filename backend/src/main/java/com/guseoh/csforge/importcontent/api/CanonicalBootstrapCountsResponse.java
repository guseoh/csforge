package com.guseoh.csforge.importcontent.api;

/** bootstrap 상태에서 PostgreSQL aggregate row 수를 반환한다. */
public record CanonicalBootstrapCountsResponse(long learningAreas, long topics, long concepts, long questions) {
}
