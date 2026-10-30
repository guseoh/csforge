package com.guseoh.csforge.learning.application;

import java.util.List;

/** 커리큘럼 순서로 페이지를 고정한 Concept별 채점 근거 목록이다. */
public record ConceptUnderstandingPageView(List<ConceptUnderstandingView> items, PageMetadataView page) {
}
