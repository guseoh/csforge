package com.guseoh.csforge.learning.domain;

/** 인접 개념 탐색에 필요한 개념 식별자와 제목을 담는 조회 모델이다. */
public record ConceptNavigationSummary(long id, String title, short level) {
}
