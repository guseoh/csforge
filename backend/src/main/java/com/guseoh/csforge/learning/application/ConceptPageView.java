package com.guseoh.csforge.learning.application;

import java.util.List;

/** Concept 목록 조회 결과를 API와 분리해 전달하는 application view이다. */
public record ConceptPageView(List<ConceptSearchItem> items, PageMetadataView page) {
}
