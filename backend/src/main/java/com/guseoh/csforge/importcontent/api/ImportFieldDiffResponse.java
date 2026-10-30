package com.guseoh.csforge.importcontent.api;

/** 변경 전후 canonical 필드의 API 표현이다. */
public record ImportFieldDiffResponse(String field, String before, String after) { }
