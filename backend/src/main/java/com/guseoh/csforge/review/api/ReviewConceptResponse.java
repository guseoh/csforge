package com.guseoh.csforge.review.api;

/**
 * 복습 문제와 연결된 Concept의 HTTP 응답이다.
 */
public record ReviewConceptResponse(long id, String slug, String title, String areaSlug, String areaName, short level) {
}
