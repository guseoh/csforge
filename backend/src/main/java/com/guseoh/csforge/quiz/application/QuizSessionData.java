package com.guseoh.csforge.quiz.application;

import java.util.List;
import java.util.Map;

import com.guseoh.csforge.question.domain.QuestionAnswer;
import com.guseoh.csforge.question.domain.QuestionChoice;
import com.guseoh.csforge.question.domain.QuestionConcept;
import com.guseoh.csforge.quiz.domain.Attempt;
import com.guseoh.csforge.quiz.domain.QuizQuestion;
import com.guseoh.csforge.quiz.domain.QuizSession;

public record QuizSessionData(
        QuizSession session,
        List<QuizQuestion> quizQuestions,
        Map<Long, Attempt> attemptsByQuestionId,
        Map<Long, List<QuestionChoice>> choicesByQuestionId,
        Map<Long, List<QuestionAnswer>> answersByQuestionId,
        Map<Long, List<QuestionConcept>> conceptsByQuestionId) {

    public QuizSessionData {
        quizQuestions = List.copyOf(quizQuestions);
        attemptsByQuestionId = Map.copyOf(attemptsByQuestionId);
        choicesByQuestionId = immutableLists(choicesByQuestionId);
        answersByQuestionId = immutableLists(answersByQuestionId);
        conceptsByQuestionId = immutableLists(conceptsByQuestionId);
    }

    private static <T> Map<Long, List<T>> immutableLists(Map<Long, List<T>> values) {
        return values.entrySet().stream()
                .collect(java.util.stream.Collectors.toUnmodifiableMap(Map.Entry::getKey, entry -> List.copyOf(entry.getValue())));
    }

    public QuizQuestion requireQuestion(long questionId) {
        return quizQuestions.stream()
                .filter(quizQuestion -> quizQuestion.getQuestion().getId().equals(questionId))
                .findFirst()
                .orElseThrow(() -> new QuizNotFoundException("Question is not part of this quiz"));
    }

    public Attempt requireAttempt(long questionId) {
        Attempt attempt = attemptsByQuestionId.get(questionId);
        if (attempt == null) {
            throw new QuizNotFoundException("Attempt is not part of this quiz");
        }
        return attempt;
    }
}
