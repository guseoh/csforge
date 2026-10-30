package com.guseoh.csforge.importcontent.api;

/** bootstrap batch 실행의 분류별 합계를 반환한다. */
public record CanonicalBootstrapTotalsResponse(int created, int updated, int unchanged, int skipped, int errors, int failed) {
}
