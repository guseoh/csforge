package com.guseoh.csforge.quiz.api;

import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Component;

import com.guseoh.csforge.learning.domain.Concept;
import com.guseoh.csforge.learning.domain.LearningArea;
import com.guseoh.csforge.learning.domain.Topic;
import com.guseoh.csforge.question.domain.QuestionAnswer;
import com.guseoh.csforge.question.domain.QuestionAnswerKind;
import com.guseoh.csforge.question.domain.QuestionConcept;
import com.guseoh.csforge.quiz.application.QuizActiveView;
import com.guseoh.csforge.quiz.application.QuizAnswerSavedResult;
import com.guseoh.csforge.quiz.application.QuizBreakdownView;
import com.guseoh.csforge.quiz.application.QuizCreatedResult;
import com.guseoh.csforge.quiz.application.QuizResultView;
import com.guseoh.csforge.quiz.application.QuizSelfCheckResult;
import com.guseoh.csforge.quiz.application.QuizSessionData;
import com.guseoh.csforge.quiz.application.QuizSessionView;
import com.guseoh.csforge.quiz.application.QuizSubmissionResult;
import com.guseoh.csforge.quiz.domain.Attempt;
import com.guseoh.csforge.quiz.domain.QuizQuestion;

/**
 * 애플리케이션 조회·명령 결과를 Quiz HTTP 응답 모델로 변환하는 API 매퍼이다.
 */
@Component
public class QuizApiMapper {

    public QuizActiveResponse toResponse(QuizActiveView view) {
        return new QuizActiveResponse(
                view.quizId(),
                view.questionCount(),
                view.answeredCount(),
                view.lastPosition(),
                view.startedAt(),
                view.expiresAt());
    }

    public QuizCreatedResponse toCreatedResponse(QuizCreatedResult result) {
        return new QuizCreatedResponse(
                result.quizId(),
                result.status(),
                result.questionCount(),
                result.startedAt(),
                result.expiresAt(),
                result.lastPosition());
    }

    public QuizRetryResponse toRetryResponse(QuizCreatedResult result) {
        return new QuizRetryResponse(
                result.quizId(),
                result.status(),
                result.questionCount(),
                result.startedAt(),
                result.expiresAt());
    }

    public QuizAnswerSavedResponse toResponse(QuizAnswerSavedResult result) {
        return new QuizAnswerSavedResponse(
                result.questionId(),
                result.selectedChoiceKey(),
                result.answerText(),
                result.reviewNeeded(),
                result.answeredAt());
    }

    public QuizSubmissionResponse toResponse(QuizSubmissionResult result) {
        return new QuizSubmissionResponse(
                result.quizId(),
                result.status(),
                result.submittedAt(),
                result.completedAt(),
                result.selfCheckPendingCount());
    }

    public QuizSelfCheckResponse toResponse(QuizSelfCheckResult result) {
        return new QuizSelfCheckResponse(
                result.quizId(),
                result.questionId(),
                result.correct(),
                result.sessionStatus());
    }

    public QuizSessionResponse toResponse(QuizSessionView view) {
        QuizSessionData data = view.data();
        return new QuizSessionResponse(
                data.session().getId(),
                data.session().getStatus(),
                data.session().getStartedAt(),
                data.session().getSubmittedAt(),
                data.session().getCompletedAt(),
                data.session().getExpiresAt(),
                view.expired(),
                data.session().getLastPosition(),
                data.answeredCount(),
                data.quizQuestions().stream().map(item -> toSessionQuestion(item, data)).toList());
    }

    public QuizResultResponse toResponse(QuizResultView view) {
        QuizSessionData data = view.data();
        return new QuizResultResponse(
                data.session().getId(),
                data.session().getStatus(),
                view.summary().total(),
                view.summary().correct(),
                view.summary().wrong(),
                view.summary().unanswered(),
                view.summary().selfCheckPending(),
                view.summary().accuracy(),
                view.breakdown().stream().map(this::toBreakdownResponse).toList(),
                data.quizQuestions().stream().map(item -> toResultQuestion(item, data)).toList());
    }

    private QuizQuestionResponse toSessionQuestion(QuizQuestion item, QuizSessionData data) {
        long questionId = item.getQuestion().getId();
        Attempt attempt = data.requireAttempt(questionId);
        QuizSavedAnswerResponse savedAnswer = attempt.hasAnswer() || attempt.isReviewNeeded()
                ? new QuizSavedAnswerResponse(
                        choiceKey(attempt),
                        attempt.getAnswerText(),
                        attempt.isReviewNeeded(),
                        attempt.getAnsweredAt())
                : null;
        return new QuizQuestionResponse(
                questionId,
                item.getPosition(),
                item.getQuestion().getPromptMarkdown(),
                item.getQuestion().getQuestionType(),
                item.getQuestion().getDifficulty(),
                concepts(data.conceptsByQuestionId().getOrDefault(questionId, List.of())),
                data.choicesByQuestionId().getOrDefault(questionId, List.of()).stream()
                        .map(choice -> new QuestionChoiceResponse(choice.getChoiceKey(), choice.getContentMarkdown()))
                        .toList(),
                savedAnswer);
    }

    private QuizQuestionResultResponse toResultQuestion(QuizQuestion item, QuizSessionData data) {
        long questionId = item.getQuestion().getId();
        Attempt attempt = data.requireAttempt(questionId);
        List<QuestionAnswer> answers = data.answersByQuestionId().getOrDefault(questionId, List.of());
        String correctChoiceKey = answers.stream()
                .filter(answer -> answer.getAnswerKind() == QuestionAnswerKind.CORRECT_CHOICE)
                .map(QuestionAnswer::getChoice)
                .filter(Objects::nonNull)
                .map(choice -> choice.getChoiceKey())
                .findFirst()
                .orElse(null);
        List<String> acceptedAnswers = answers.stream()
                .filter(answer -> answer.getAnswerKind() == QuestionAnswerKind.ACCEPTED_TEXT)
                .map(QuestionAnswer::getAnswerText)
                .toList();
        String modelAnswer = answers.stream()
                .filter(answer -> answer.getAnswerKind() == QuestionAnswerKind.MODEL_ANSWER)
                .map(QuestionAnswer::getAnswerText)
                .findFirst()
                .orElse(null);
        return new QuizQuestionResultResponse(
                questionId,
                item.getPosition(),
                item.getQuestion().getPromptMarkdown(),
                item.getQuestion().getQuestionType(),
                item.getQuestion().getDifficulty(),
                concepts(data.conceptsByQuestionId().getOrDefault(questionId, List.of())),
                choiceKey(attempt),
                attempt.getAnswerText(),
                attempt.isReviewNeeded(),
                attempt.getGradingStatus(),
                attempt.getCorrect(),
                correctChoiceKey,
                acceptedAnswers,
                modelAnswer,
                item.getQuestion().getExplanationMarkdown(),
                attempt.getAnsweredAt(),
                attempt.getGradedAt());
    }

    private QuizBreakdownResponse toBreakdownResponse(QuizBreakdownView view) {
        return new QuizBreakdownResponse(
                view.areaSlug(),
                view.areaName(),
                view.topicSlug(),
                view.topicTitle(),
                view.total(),
                view.correct(),
                view.wrong(),
                view.unanswered(),
                view.selfCheckPending());
    }

    private List<QuizConceptResponse> concepts(List<QuestionConcept> links) {
        return links.stream().map(link -> {
            Concept concept = link.getConcept();
            Topic topic = concept.getTopic();
            LearningArea area = topic.getLearningArea();
            return new QuizConceptResponse(
                    concept.getId(),
                    concept.getSlug(),
                    concept.getTitle(),
                    area.getSlug(),
                    area.getName(),
                    concept.getLevel());
        }).toList();
    }

    private static String choiceKey(Attempt attempt) {
        return attempt.getSelectedChoice() == null ? null : attempt.getSelectedChoice().getChoiceKey();
    }
}
