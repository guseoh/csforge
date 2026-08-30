package com.guseoh.csforge.importcontent.application;

/** canonical 항목의 변경 전후 한 필드 차이이다. */
public record ImportFieldDiff(String field, String before, String after) { }
