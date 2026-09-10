package com.guseoh.csforge.importcontent.application;

/** canonical aggregate의 현재 row 수를 표현한다. */
public record CanonicalBootstrapCounts(long learningAreas, long topics, long concepts, long questions) {
}
