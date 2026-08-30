package com.guseoh.csforge.importcontent.api;

/** atomic apply의 성공/skip/failure 합계 응답이다. */
public record ImportApplyTotalsResponse(int created, int updated, int unchanged, int skipped, int failed) { }
