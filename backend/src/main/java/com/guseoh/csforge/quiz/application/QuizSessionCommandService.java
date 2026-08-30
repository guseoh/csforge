package com.guseoh.csforge.quiz.application;

import java.time.Clock;
import java.time.Instant;
import java.util.List;

import com.guseoh.csforge.question.domain.QuestionChoice;
import com.guseoh.csforge.question.domain.QuestionChoiceRepository;
import com.guseoh.csforge.question.domain.QuestionType;
import com.guseoh.csforge.quiz.api.QuizAnswerSaveRequest;
import com.guseoh.csforge.quiz.api.QuizAnswerSavedResponse;
import com.guseoh.csforge.quiz.api.QuizPositionUpdateRequest;
import com.guseoh.csforge.quiz.api.QuizSelfCheckRequest;
import com.guseoh.csforge.quiz.api.QuizSelfCheckResponse;
import com.guseoh.csforge.quiz.api.QuizSubmissionResponse;
import com.guseoh.csforge.quiz.application.grading.QuizGradingService;
import com.guseoh.csforge.quiz.domain.Attempt;
import com.guseoh.csforge.quiz.domain.AttemptRepository;
import com.guseoh.csforge.quiz.domain.AttemptGradingStatus;
import com.guseoh.csforge.quiz.domain.QuizAnswerException;
import com.guseoh.csforge.quiz.domain.QuizInvalidStateException;
import com.guseoh.csforge.quiz.domain.QuizQuestion;
import com.guseoh.csforge.quiz.domain.QuizSessionRepository;
import com.guseoh.csforge.quiz.domain.QuizSessionStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuizSessionCommandService {

    private final QuizSessionDataLoader dataLoader;
    private final QuestionChoiceRepository choiceRepository;
    private final AttemptRepository attemptRepository;
    private final QuizSessionRepository sessionRepository;
    private final QuizGradingService gradingService;
    private final Clock clock;

    public QuizSessionCommandService(
            QuizSessionDataLoader dataLoader,
            QuestionChoiceRepository choiceRepository,
            AttemptRepository attemptRepository,
            QuizSessionRepository sessionRepository,
            QuizGradingService gradingService,
            Clock clock) {
        this.dataLoader = dataLoader;
        this.choiceRepository = choiceRepository;
        this.attemptRepository = attemptRepository;
        this.sessionRepository = sessionRepository;
        this.gradingService = gradingService;
        this.clock = clock;
    }

    @Transactional
    public QuizAnswerSavedResponse saveAnswer(long quizId, long questionId, QuizAnswerSaveRequest request) {
        QuizSessionData data = dataLoader.load(quizId);
        Instant now = Instant.now(clock);
        data.session().ensureAcceptingChanges(now);
        QuizQuestion quizQuestion = data.requireQuestion(questionId);
        Attempt attempt = data.requireAttempt(questionId);
        QuestionType type = quizQuestion.getQuestion().getQuestionType();
        if (request.reviewNeeded() == null) {
            throw new QuizAnswerException("reviewNeeded is required");
        }
        String choiceKey = normalize(request.selectedChoiceKey());
        if (type == QuestionType.MULTIPLE_CHOICE) {
            if (request.answerText() != null && !request.answerText().isBlank()) {
                throw new QuizAnswerException("Multiple-choice answers cannot include answerText");
            }
            if (choiceKey == null) {
                attempt.clearChoice(now);
            } else {
                QuestionChoice choice = choiceRepository.findByQuestionIdAndChoiceKey(questionId, choiceKey)
                        .orElseThrow(() -> new QuizAnswerException("selectedChoiceKey is not a choice for this question"));
                attempt.saveChoice(choice, now);
            }
        } else {
            if (choiceKey != null) {
                throw new QuizAnswerException("Only multiple-choice questions accept selectedChoiceKey");
            }
            attempt.saveText(request.answerText(), now);
        }
        if (request.reviewNeeded()) {
            attempt.markReviewNeeded();
        } else {
            attempt.clearReviewNeeded();
        }
        attemptRepository.saveAndFlush(attempt);
        return new QuizAnswerSavedResponse(
                questionId,
                attempt.getSelectedChoice() == null ? null : attempt.getSelectedChoice().getChoiceKey(),
                attempt.getAnswerText(),
                attempt.isReviewNeeded(),
                attempt.getAnsweredAt());
    }

    @Transactional
    public void savePosition(long quizId, QuizPositionUpdateRequest request) {
        QuizSessionData data = dataLoader.load(quizId);
        Instant now = Instant.now(clock);
        data.session().ensureAcceptingChanges(now);
        data.session().recordPosition(request.position(), data.quizQuestions().size());
        sessionRepository.saveAndFlush(data.session());
    }

    @Transactional
    public QuizSubmissionResponse submit(long quizId) {
        QuizSessionData data = dataLoader.load(quizId);
        Instant now = Instant.now(clock);
        if (data.session().getStatus() == QuizSessionStatus.IN_PROGRESS) {
            data.session().submit(now);
            for (QuizQuestion quizQuestion : data.quizQuestions()) {
                long questionId = quizQuestion.getQuestion().getId();
                gradingService.grade(
                        quizQuestion.getQuestion(),
                        data.requireAttempt(questionId),
                        data.answersByQuestionId().getOrDefault(questionId, List.of()),
                        now);
            }
            attemptRepository.saveAllAndFlush(data.attemptsByQuestionId().values());
            if (selfCheckPending(data) == 0) {
                data.session().complete(now);
            }
            sessionRepository.saveAndFlush(data.session());
        }
        return submission(data);
    }

    @Transactional
    public QuizSelfCheckResponse selfCheck(long quizId, long questionId, QuizSelfCheckRequest request) {
        QuizSessionData data = dataLoader.load(quizId);
        if (data.session().getStatus() != QuizSessionStatus.SUBMITTED
                && data.session().getStatus() != QuizSessionStatus.COMPLETED) {
            throw new QuizInvalidStateException("Quiz must be submitted before self-check");
        }
        QuizQuestion quizQuestion = data.requireQuestion(questionId);
        QuestionType type = quizQuestion.getQuestion().getQuestionType();
        if (type != QuestionType.DESCRIPTIVE && type != QuestionType.SCENARIO) {
            throw new QuizAnswerException("Only descriptive and scenario questions require self-check");
        }
        Attempt attempt = data.requireAttempt(questionId);
        Instant now = Instant.now(clock);
        attempt.completeSelfCheck(request.correct(), now);
        attemptRepository.saveAndFlush(attempt);
        if (data.session().getStatus() == QuizSessionStatus.SUBMITTED && selfCheckPending(data) == 0) {
            data.session().complete(now);
            sessionRepository.saveAndFlush(data.session());
        }
        return new QuizSelfCheckResponse(quizId, questionId, attempt.getCorrect(), data.session().getStatus());
    }

    private int selfCheckPending(QuizSessionData data) {
        return (int) data.attemptsByQuestionId().values().stream()
                .filter(attempt -> attempt.getGradingStatus() == AttemptGradingStatus.SELF_CHECK_REQUIRED)
                .count();
    }

    private QuizSubmissionResponse submission(QuizSessionData data) {
        return new QuizSubmissionResponse(
                data.session().getId(),
                data.session().getStatus(),
                data.session().getSubmittedAt(),
                data.session().getCompletedAt(),
                selfCheckPending(data));
    }

    private static String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
