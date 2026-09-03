package com.guseoh.csforge.ai.api;

/** AI 결과가 가리키는 canonical Concept navigation 정보이다. */
public record WrongAnswerRelatedConceptResponse(
        long id,
        String contentKey,
        String slug,
        String title,
        String areaSlug,
        String areaName,
        short level) {
}
