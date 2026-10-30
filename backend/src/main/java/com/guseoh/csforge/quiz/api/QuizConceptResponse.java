package com.guseoh.csforge.quiz.api;

public record QuizConceptResponse(
        long id,
        String slug,
        String title,
        String areaSlug,
        String areaName,
        short level) {
}
