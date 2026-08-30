package com.guseoh.csforge.quiz.application;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import com.guseoh.csforge.question.domain.QuestionAnswer;
import com.guseoh.csforge.question.domain.QuestionAnswerRepository;
import com.guseoh.csforge.question.domain.QuestionChoice;
import com.guseoh.csforge.question.domain.QuestionChoiceRepository;
import com.guseoh.csforge.question.domain.QuestionConcept;
import com.guseoh.csforge.question.domain.QuestionConceptRepository;
import com.guseoh.csforge.quiz.domain.Attempt;
import com.guseoh.csforge.quiz.domain.AttemptRepository;
import com.guseoh.csforge.quiz.domain.QuizQuestion;
import com.guseoh.csforge.quiz.domain.QuizQuestionRepository;
import com.guseoh.csforge.quiz.domain.QuizSession;
import com.guseoh.csforge.quiz.domain.QuizSessionRepository;

/**
 * 퀴즈 조회 유스케이스별로 필요한 연관 데이터를 묶어서 로딩하는 조회 컴포넌트이다.
 */
@Component
@RequiredArgsConstructor
public class QuizSessionDataLoader {

    private final QuizSessionRepository sessionRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final AttemptRepository attemptRepository;
    private final QuestionChoiceRepository choiceRepository;
    private final QuestionAnswerRepository answerRepository;
    private final QuestionConceptRepository conceptRepository;

    public QuizSessionData loadForSession(long quizId) {
        CoreData core = loadCore(quizId);
        return new QuizSessionData(
                core.session(),
                core.quizQuestions(),
                core.attempts(),
                groupByQuestion(choiceRepository.findForQuestionIds(core.questionIds())),
                Map.of(),
                groupByQuestion(conceptRepository.findForQuestionIds(core.questionIds())));
    }

    public QuizSessionData loadForGrading(long quizId) {
        CoreData core = loadCore(quizId);
        return new QuizSessionData(
                core.session(),
                core.quizQuestions(),
                core.attempts(),
                Map.of(),
                groupByQuestion(answerRepository.findForQuestionIds(core.questionIds())),
                Map.of());
    }

    public QuizSessionData loadForResult(long quizId) {
        CoreData core = loadCore(quizId);
        return new QuizSessionData(
                core.session(),
                core.quizQuestions(),
                core.attempts(),
                Map.of(),
                groupByQuestion(answerRepository.findForQuestionIds(core.questionIds())),
                groupByQuestion(conceptRepository.findForQuestionIds(core.questionIds())));
    }

    public QuizSessionData loadForRetry(long quizId) {
        CoreData core = loadCore(quizId);
        return new QuizSessionData(
                core.session(),
                core.quizQuestions(),
                core.attempts(),
                Map.of(),
                Map.of(),
                Map.of());
    }

    private CoreData loadCore(long quizId) {
        QuizSession session = sessionRepository.findById(quizId)
                .orElseThrow(() -> new QuizNotFoundException("Quiz session was not found"));
        List<QuizQuestion> quizQuestions = quizQuestionRepository.findByQuizSession_IdOrderByPositionAsc(quizId);
        List<Long> questionIds = quizQuestions.stream().map(item -> item.getQuestion().getId()).toList();
        if (questionIds.isEmpty()) {
            return new CoreData(session, quizQuestions, Map.of(), questionIds);
        }

        Map<Long, Attempt> attempts = attemptRepository.findByQuizSession_IdOrderByQuestion_IdAsc(quizId).stream()
                .collect(Collectors.toMap(
                        item -> item.getQuestion().getId(),
                        Function.identity(),
                        (left, right) -> left,
                        LinkedHashMap::new));
        return new CoreData(session, quizQuestions, attempts, questionIds);
    }

    private static <T> Map<Long, List<T>> groupByQuestion(List<T> values) {
        Map<Long, List<T>> grouped = new LinkedHashMap<>();
        for (T value : values) {
            long questionId = switch (value) {
                case QuestionChoice choice -> choice.getQuestion().getId();
                case QuestionAnswer answer -> answer.getQuestion().getId();
                case QuestionConcept concept -> concept.getQuestion().getId();
                default -> throw new IllegalArgumentException("Unsupported question data");
            };
            grouped.computeIfAbsent(questionId, ignored -> new ArrayList<>()).add(value);
        }
        return grouped;
    }

    private record CoreData(
            QuizSession session,
            List<QuizQuestion> quizQuestions,
            Map<Long, Attempt> attempts,
            List<Long> questionIds) {
    }
}
