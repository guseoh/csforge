package com.guseoh.csforge.wrongnote.application;

import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.wrongnote.domain.WrongNoteStatus;

/**
 * 필터된 오답 노트 묶음 재풀이 퀴즈를 생성하기 위한 애플리케이션 명령 모델이다.
 */
public record WrongNoteBulkRetryCommand(
        String areaSlug,
        Long topicId,
        Short level,
        QuestionDifficulty difficulty,
        WrongNoteStatus status,
        int count) {

    public WrongNoteBulkRetryCommand {
        if (count < 1 || count > 50) throw new IllegalArgumentException("count must be between 1 and 50");
        if (level != null && (level < 1 || level > 3)) throw new IllegalArgumentException("level must be between 1 and 3");
        areaSlug = areaSlug == null || areaSlug.isBlank() ? null : areaSlug.trim();
        status = status == null ? WrongNoteStatus.ACTIVE : status;
    }
}
