package com.guseoh.csforge.importcontent.api;

/** import 변경 분류별 합계 응답이다. */
public record ImportTotalsResponse(int created, int updated, int unchanged, int skipped, int errors) { }
