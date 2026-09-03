package com.guseoh.csforge.search.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

/** Question 검색 projection이 canonical grading secret을 source로 노출하지 않는 계약을 검증한다. */
class SearchProjectionDocumentTest {

    @Test
    void questionSourceContainsNavigationMetadataButNoGradingAnswerStructures() {
        SearchProjectionDocument document = new SearchProjectionDocument(
                new SearchDocumentRef(SearchDocumentType.QUESTION, 42L),
                "volatile happens-before 질문",
                "질문 본문과 설명",
                "설명 요약",
                List.of("java"),
                List.of("Java"),
                List.of("java-memory-model"),
                List.of("Java Memory Model"),
                List.of(7L),
                List.of("java.jmm.volatile"),
                List.of(3),
                Instant.parse("2026-09-03T00:00:00Z"),
                7L,
                42L,
                null,
                "MULTIPLE_CHOICE",
                "HARD",
                null,
                null);

        Map<String, Object> source = document.toSource();

        assertEquals("QUESTION:42", source.get("documentKey"));
        assertEquals(42L, source.get("questionId"));
        assertEquals(7L, source.get("conceptId"));
        assertFalse(source.containsKey("correctChoiceId"));
        assertFalse(source.containsKey("correctChoiceIds"));
        assertFalse(source.containsKey("acceptedAnswers"));
        assertFalse(source.containsKey("modelAnswer"));
        assertFalse(source.containsKey("answer"));
    }
}
