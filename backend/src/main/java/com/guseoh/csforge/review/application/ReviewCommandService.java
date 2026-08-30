package com.guseoh.csforge.review.application;

import java.time.Clock;
import java.time.Instant;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.guseoh.csforge.question.domain.QuestionRepository;
import com.guseoh.csforge.quiz.application.QuizCreatedResult;
import com.guseoh.csforge.quiz.application.QuizSessionCreator;
import com.guseoh.csforge.quiz.domain.QuizSessionSource;
import com.guseoh.csforge.review.domain.ReviewSchedule;
import com.guseoh.csforge.review.domain.ReviewScheduleRepository;

/**
 * 복습 일정 생성과 REVIEW source 퀴즈 시작을 처리한다.
 */
@Service
@RequiredArgsConstructor
public class ReviewCommandService {

    private final ReviewScheduleRepository scheduleRepository;
    private final QuestionRepository questionRepository;
    private final QuizSessionCreator sessionCreator;
    private final Clock clock;

    @Transactional
    public ReviewScheduledView schedule(long questionId) {
        Instant now = Instant.now(clock);
        ReviewSchedule schedule = scheduleRepository.findByQuestionId(questionId).orElseGet(
                () -> ReviewSchedule.start(questionRepository.getReferenceById(questionId), null, now));
        schedule.scheduleFromFirstStage(now);
        scheduleRepository.save(schedule);
        return new ReviewScheduledView(schedule.getQuestionId(), schedule.getStatus(), schedule.getStage(), schedule.getDueAt());
    }

    @Transactional
    public QuizCreatedResult createQuiz(ReviewQuizSetupCommand command) {
        Instant now = Instant.now(clock);
        List<Long> questionIds = scheduleRepository.findEligibleQuestionIds(
                com.guseoh.csforge.review.domain.ReviewScheduleStatus.SCHEDULED,
                now,
                PageRequest.of(0, command.count()));
        if (questionIds.isEmpty()) throw new NoDueReviewsException();
        return sessionCreator.create(questionIds, now, null, QuizSessionSource.REVIEW);
    }
}
