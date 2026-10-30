package com.guseoh.csforge.importcontent.sync;

import com.guseoh.csforge.quiz.domain.QuizQuestionRepository;
import com.guseoh.csforge.review.domain.ReviewHistoryRepository;
import com.guseoh.csforge.review.domain.ReviewScheduleRepository;
import com.guseoh.csforge.wrongnote.domain.WrongNoteRepository;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** 풀이 외의 퀴즈·오답·복습 기록도 변경 후보에서 제외한다. */
@Component
@RequiredArgsConstructor
public class QuestionPersonalHistory {
    private final QuizQuestionRepository quizQuestions;
    private final WrongNoteRepository wrongNotes;
    private final ReviewScheduleRepository schedules;
    private final ReviewHistoryRepository reviews;

    public Set<Long> findQuestionIds(Collection<Long> questionIds) {
        if (questionIds.isEmpty()) return Set.of();
        Set<Long> result = new HashSet<>(quizQuestions.findQuestionIdsInSessions(questionIds));
        result.addAll(wrongNotes.findQuestionIdsWithNotes(questionIds));
        result.addAll(schedules.findQuestionIdsWithSchedules(questionIds));
        result.addAll(reviews.findQuestionIdsWithHistory(questionIds));
        return Set.copyOf(result);
    }
}
