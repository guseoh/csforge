package com.guseoh.csforge.quiz.application;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionRepository;
import com.guseoh.csforge.quiz.domain.Attempt;
import com.guseoh.csforge.quiz.domain.AttemptRepository;
import com.guseoh.csforge.quiz.domain.QuizQuestion;
import com.guseoh.csforge.quiz.domain.QuizQuestionRepository;
import com.guseoh.csforge.quiz.domain.QuizSession;
import com.guseoh.csforge.quiz.domain.QuizSessionRepository;
import com.guseoh.csforge.quiz.domain.QuizSessionSource;

/**
 * 선택된 문제 순서와 source로 퀴즈 세션 및 초기 Attempt를 생성한다.
 */
@Component
@RequiredArgsConstructor
public class QuizSessionCreator {

    private final QuizSessionRepository sessionRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final AttemptRepository attemptRepository;
    private final QuestionRepository questionRepository;

    public QuizCreatedResult create(
            List<Long> questionIds,
            Instant startedAt,
            Instant expiresAt,
            QuizSessionSource source) {
        if (questionIds == null || questionIds.isEmpty()) {
            throw new IllegalArgumentException("questionIds must not be empty");
        }
        QuizSession session = sessionRepository.saveAndFlush(QuizSession.start(startedAt, expiresAt, source));
        List<QuizQuestion> quizQuestions = new ArrayList<>(questionIds.size());
        for (int position = 0; position < questionIds.size(); position++) {
            Question question = questionRepository.getReferenceById(questionIds.get(position));
            quizQuestions.add(QuizQuestion.place(session, question, position));
        }
        quizQuestionRepository.saveAll(quizQuestions);
        attemptRepository.saveAll(quizQuestions.stream()
                .map(item -> Attempt.unanswered(session, item.getQuestion()))
                .toList());
        return new QuizCreatedResult(
                session.getId(),
                session.getStatus(),
                quizQuestions.size(),
                session.getStartedAt(),
                session.getExpiresAt(),
                session.getLastPosition(),
                session.getSource());
    }
}
