package com.guseoh.csforge.wrongnote.api;

import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.wrongnote.domain.WrongNoteStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/**
 * 필터 조건에 맞는 오답 노트 문항을 묶어 재풀이 퀴즈를 시작하는 HTTP 요청 모델이다.
 */
public record WrongNoteBulkRetryRequest(
        String area,
        Long topic,
        @Min(1) @Max(3) Short level,
        QuestionDifficulty difficulty,
        WrongNoteStatus status,
        @Min(1) @Max(50) Integer count) {
}
