package com.guseoh.csforge.quiz.application;

import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import com.guseoh.csforge.learning.domain.Concept;
import com.guseoh.csforge.learning.domain.LearningArea;
import com.guseoh.csforge.learning.domain.Topic;
import com.guseoh.csforge.question.domain.QuestionAnswer;
import com.guseoh.csforge.question.domain.QuestionAnswerKind;
import com.guseoh.csforge.question.domain.QuestionChoice;
import com.guseoh.csforge.question.domain.QuestionConcept;
import com.guseoh.csforge.quiz.api.QuestionChoiceResponse;
import com.guseoh.csforge.quiz.api.QuizActiveResponse;
import com.guseoh.csforge.quiz.api.QuizBreakdownResponse;
import com.guseoh.csforge.quiz.api.QuizConceptResponse;
import com.guseoh.csforge.quiz.api.QuizQuestionResponse;
import com.guseoh.csforge.quiz.api.QuizQuestionResultResponse;
import com.guseoh.csforge.quiz.api.QuizResultResponse;
import com.guseoh.csforge.quiz.api.QuizSavedAnswerResponse;
import com.guseoh.csforge.quiz.api.QuizSessionResponse;
import com.guseoh.csforge.quiz.domain.Attempt;
import com.guseoh.csforge.quiz.domain.AttemptGradingStatus;
import com.guseoh.csforge.quiz.domain.QuizQuestion;
import com.guseoh.csforge.quiz.domain.QuizSessionStatus;
import org.springframework.stereotype.Component;

@Component
public class QuizResponseAssembler {

    private final Clock clock;

    public QuizResponseAssembler(Clock clock) {
        this.clock = clock;
    }

    public QuizActiveResponse toActiveResponse(QuizSessionData data) {
        return new QuizActiveResponse(
                data.session().getId(),
                data.quizQuestions().size(),
                (int) data.attemptsByQuestionId().values().stream().filter(Attempt::hasAnswer).count(),
                data.session().getLastPosition(),
                data.session().getStartedAt(),
                data.session().getExpiresAt());
    }

    public QuizSessionResponse toSessionResponse(QuizSessionData data) {
        Instant now = Instant.now(clock);
        List<QuizQuestionResponse> questions = data.quizQuestions().stream()
                .map(item -> toSessionQuestion(item, data))
                .toList();
        return new QuizSessionResponse(
                data.session().getId(),
                data.session().getStatus(),
                data.session().getStartedAt(),
                data.session().getSubmittedAt(),
                data.session().getCompletedAt(),
                data.session().getExpiresAt(),
                data.session().isExpired(now),
                data.session().getLastPosition(),
                (int) data.attemptsByQuestionId().values().stream().filter(Attempt::hasAnswer).count(),
                questions);
    }

    public QuizResultResponse toResultResponse(QuizSessionData data) {
        if (data.session().getStatus() == QuizSessionStatus.IN_PROGRESS) {
            throw new com.guseoh.csforge.quiz.domain.QuizInvalidStateException("Quiz must be submitted before its result is available");
        }
        List<QuizQuestionResultResponse> questions = data.quizQuestions().stream()
                .map(item -> toResultQuestion(item, data))
                .toList();

        int correct = 0;
        int wrong = 0;
        int unanswered = 0;
        int pending = 0;
        for (QuizQuestionResultResponse question : questions) {
            if (question.gradingStatus() == AttemptGradingStatus.SELF_CHECK_REQUIRED) {
                pending++;
            } else if (!hasAnswer(question)) {
                unanswered++;
            } else if (Boolean.TRUE.equals(question.correct())) {
                correct++;
            } else if (question.gradingStatus() == AttemptGradingStatus.GRADED
                    || question.gradingStatus() == AttemptGradingStatus.SELF_CHECKED) {
                wrong++;
            }
        }
        int gradedAnswered = correct + wrong;
        Double accuracy = gradedAnswered == 0 ? null : (double) correct / gradedAnswered;
        return new QuizResultResponse(
                data.session().getId(),
                data.session().getStatus(),
                questions.size(),
                correct,
                wrong,
                unanswered,
                pending,
                accuracy,
                breakdown(questions, data),
                questions);
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

    private List<QuizBreakdownResponse> breakdown(List<QuizQuestionResultResponse> questions, QuizSessionData data) {
        Map<BreakdownKey, BreakdownCounts> counts = new LinkedHashMap<>();
        for (QuizQuestionResultResponse question : questions) {
            List<QuestionConcept> links = data.conceptsByQuestionId().getOrDefault(question.questionId(), List.of());
            if (links.isEmpty()) {
                continue;
            }
            Concept concept = links.getFirst().getConcept();
            Topic topic = concept.getTopic();
            LearningArea area = topic.getLearningArea();
            BreakdownKey key = new BreakdownKey(area.getSlug(), area.getName(), topic.getSlug(), topic.getTitle());
            counts.computeIfAbsent(key, ignored -> new BreakdownCounts()).add(question);
        }
        return counts.entrySet().stream()
                .map(entry -> entry.getValue().toResponse(entry.getKey()))
                .toList();
    }

    private List<QuizConceptResponse> concepts(List<QuestionConcept> links) {
        return links.stream().map(link -> {
            Concept concept = link.getConcept();
            Topic topic = concept.getTopic();
            LearningArea area = topic.getLearningArea();
            return new QuizConceptResponse(
                    concept.getId(), concept.getSlug(), concept.getTitle(), area.getSlug(), area.getName(), concept.getLevel());
        }).toList();
    }

    private static String choiceKey(Attempt attempt) {
        return attempt.getSelectedChoice() == null ? null : attempt.getSelectedChoice().getChoiceKey();
    }

    private static boolean hasAnswer(QuizQuestionResultResponse question) {
        return question.selectedChoiceKey() != null
                || (question.answerText() != null && !question.answerText().isBlank());
    }

    private record BreakdownKey(String areaSlug, String areaName, String topicSlug, String topicTitle) {
    }

    private static final class BreakdownCounts {
        private int total;
        private int correct;
        private int wrong;
        private int unanswered;
        private int selfCheckPending;

        private void add(QuizQuestionResultResponse question) {
            total++;
            if (question.gradingStatus() == AttemptGradingStatus.SELF_CHECK_REQUIRED) {
                selfCheckPending++;
            } else if (!hasAnswer(question)) {
                unanswered++;
            } else if (Boolean.TRUE.equals(question.correct())) {
                correct++;
            } else if (question.gradingStatus() == AttemptGradingStatus.GRADED
                    || question.gradingStatus() == AttemptGradingStatus.SELF_CHECKED) {
                wrong++;
            }
        }

        private QuizBreakdownResponse toResponse(BreakdownKey key) {
            return new QuizBreakdownResponse(key.areaSlug(), key.areaName(), key.topicSlug(), key.topicTitle(),
                    total, correct, wrong, unanswered, selfCheckPending);
        }
    }
}
