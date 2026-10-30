package com.guseoh.csforge.learning.application;

/** Concept 상세 조회의 인접 Concept 정보를 전달하는 application view이다. */
public record ConceptNavigationView(long id, String title, short level) {
}
