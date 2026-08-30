package com.guseoh.csforge.quiz.application;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

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
import org.springframework.stereotype.Component;

@Component
public class QuizSessionDataLoader {

    private final QuizSessionRepository sessionRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final AttemptRepository attemptRepository;
    private final QuestionChoiceRepository choiceRepository;
    private final QuestionAnswerRepository answerRepository;
    private final QuestionConceptRepository conceptRepository;

    public QuizSessionDataLoader(
            QuizSessionRepository sessionRepository,
            QuizQuestionRepository quizQuestionRepository,
            AttemptRepository attemptRepository,
            QuestionChoiceRepository choiceRepository,
            QuestionAnswerRepository answerRepository,
            QuestionConceptRepository conceptRepository) {
        this.sessionRepository = sessionRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.attemptRepository = attemptRepository;
        this.choiceRepository = choiceRepository;
        this.answerRepository = answerRepository;
        this.conceptRepository = conceptRepository;
    }

    public QuizSessionData load(long quizId) {
        QuizSession session = sessionRepository.findById(quizId)
                .orElseThrow(() -> new QuizNotFoundException("Quiz session was not found"));
        List<QuizQuestion> quizQuestions = quizQuestionRepository.findByQuizSession_IdOrderByPositionAsc(quizId);
        List<Long> questionIds = quizQuestions.stream().map(item -> item.getQuestion().getId()).toList();
        if (questionIds.isEmpty()) {
            return new QuizSessionData(session, quizQuestions, Map.of(), Map.of(), Map.of(), Map.of());
        }

        Map<Long, Attempt> attempts = attemptRepository.findByQuizSession_IdOrderByQuestion_IdAsc(quizId).stream()
                .collect(Collectors.toMap(item -> item.getQuestion().getId(), Function.identity(), (left, right) -> left,
                        LinkedHashMap::new));
        return new QuizSessionData(
                session,
                quizQuestions,
                attempts,
                groupByQuestion(choiceRepository.findForQuestionIds(questionIds)),
                groupByQuestion(answerRepository.findForQuestionIds(questionIds)),
                groupByQuestion(conceptRepository.findForQuestionIds(questionIds)));
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
            grouped.computeIfAbsent(questionId, ignored -> new java.util.ArrayList<>()).add(value);
        }
        return grouped;
    }
}
