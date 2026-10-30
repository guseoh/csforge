package com.guseoh.csforge.importcontent.api;

/** Preview에 포함된 source file의 항목 수를 보여주는 응답이다. */
public record ImportFileSummaryResponse(String fileName, int itemCount) { }
