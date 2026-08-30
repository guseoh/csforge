package com.guseoh.csforge.quiz.application;

import java.time.Clock;
import java.time.Instant;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.guseoh.csforge.question.domain.QuestionChoice;
import com.guseoh.csforge.question.domain.QuestionChoiceRepository;
import com.guseoh.csforge.question.domain.QuestionType;
import com.guseoh.csforge.outcome.application.FinalizedAttemptOutcomeCoordinator;
import com.guseoh.csforge.quiz.application.grading.QuizGradingService;
import com.guseoh.csforge.quiz.domain.Attempt;
import com.guseoh.csforge.quiz.domain.AttemptGradingStatus;
import com.guseoh.csforge.quiz.domain.AttemptRepository;
import com.guseoh.csforge.quiz.domain.QuizAnswerException;
import com.guseoh.csforge.quiz.domain.QuizQuestion;
import com.guseoh.csforge.quiz.domain.QuizQuestionRepository;
import com.guseoh.csforge.quiz.domain.QuizSession;
import com.guseoh.csforge.quiz.domain.QuizSessionRepository;
import com.guseoh.csforge.quiz.domain.QuizSessionStatus;

/**
 * 퀴즈 답안 저장, 위치 변경, 제출과 자기채점 상태 변경을 처리하는 애플리케이션 서비스이다.
 */
@Service
@RequiredArgsConstructor
public class QuizSessionCommandService {

    private final QuizSessionDataLoader dataLoader;
    private final QuestionChoiceRepository choiceRepository;
    private final AttemptRepository attemptRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizSessionRepository sessionRepository;
    private final QuizGradingService gradingService;
    private final FinalizedAttemptOutcomeCoordinator outcomeCoordinator;
    private final Clock clock;

    @Transactional
    public QuizAnswerSavedResult saveAnswer(long quizId, long questionId, QuizAnswerCommand command) {
        QuizSession session = requireSession(quizId);
        Instant now = Instant.now(clock);
        session.ensureAcceptingChanges(now);

        QuizQuestion quizQuestion = quizQuestionRepository.findByQuizSession_IdAndQuestion_Id(quizId, questionId)
                .orElseThrow(() -> new QuizNotFoundException("Question is not part of this quiz"));
        Attempt attempt = attemptRepository.findByQuizSession_IdAndQuestion_Id(quizId, questionId)
                .orElseThrow(() -> new QuizNotFoundException("Attempt is not part of this quiz"));

        saveAnswerByType(quizQuestion, attempt, command, now);
        if (command.reviewNeeded()) {
            attempt.markReviewNeeded();
        } else {
            attempt.clearReviewNeeded();
        }

        return new QuizAnswerSavedResult(
                questionId,
                attempt.getSelectedChoice() == null ? null : attempt.getSelectedChoice().getChoiceKey(),
                attempt.getAnswerText(),
                attempt.isReviewNeeded(),
                attempt.getAnsweredAt());
    }

    @Transactional
    public void savePosition(long quizId, int position) {
        QuizSession session = requireSession(quizId);
        session.ensureAcceptingChanges(Instant.now(clock));
        int questionCount = Math.toIntExact(quizQuestionRepository.countByQuizSession_Id(quizId));
        session.recordPosition(position, questionCount);
    }

    @Transactional
    public QuizSubmissionResult submit(long quizId) {
        QuizSessionData data = dataLoader.loadForGrading(quizId);
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
            data.attemptsByQuestionId().values().forEach(outcomeCoordinator::process);
            if (selfCheckPending(data) == 0) {
                data.session().complete(now);
            }
        }
        return submission(data);
    }

    @Transactional
    public QuizSelfCheckResult selfCheck(long quizId, long questionId, boolean correct) {
        QuizSession session = requireSession(quizId);
        session.ensureSelfCheckAvailable();

        QuizQuestion quizQuestion = quizQuestionRepository.findByQuizSession_IdAndQuestion_Id(quizId, questionId)
                .orElseThrow(() -> new QuizNotFoundException("Question is not part of this quiz"));
        QuestionType type = quizQuestion.getQuestion().getQuestionType();
        if (type != QuestionType.DESCRIPTIVE && type != QuestionType.SCENARIO) {
            throw new QuizAnswerException("Only descriptive and scenario questions require self-check");
        }

        Attempt attempt = attemptRepository.findByQuizSession_IdAndQuestion_Id(quizId, questionId)
                .orElseThrow(() -> new QuizNotFoundException("Attempt is not part of this quiz"));
        Instant now = Instant.now(clock);
        attempt.completeSelfCheck(correct, now);
        attemptRepository.saveAndFlush(attempt);
        outcomeCoordinator.process(attempt);

        long pending = attemptRepository.countByQuizSession_IdAndGradingStatus(
                quizId,
                AttemptGradingStatus.SELF_CHECK_REQUIRED);
        if (session.getStatus() == QuizSessionStatus.SUBMITTED && pending == 0) {
            session.complete(now);
        }
        return new QuizSelfCheckResult(quizId, questionId, attempt.getCorrect(), session.getStatus());
    }

    private void saveAnswerByType(
            QuizQuestion quizQuestion,
            Attempt attempt,
            QuizAnswerCommand command,
            Instant now) {
        QuestionType type = quizQuestion.getQuestion().getQuestionType();
        String choiceKey = normalize(command.selectedChoiceKey());
        if (type == QuestionType.MULTIPLE_CHOICE) {
            if (command.answerText() != null && !command.answerText().isBlank()) {
                throw new QuizAnswerException("Multiple-choice answers cannot include answerText");
            }
            if (choiceKey == null) {
                attempt.clearChoice();
                return;
            }
            QuestionChoice choice = choiceRepository.findByQuestionIdAndChoiceKey(
                            quizQuestion.getQuestion().getId(),
                            choiceKey)
                    .orElseThrow(() -> new QuizAnswerException("selectedChoiceKey is not a choice for this question"));
            attempt.saveChoice(choice, now);
            return;
        }

        if (choiceKey != null) {
            throw new QuizAnswerException("Only multiple-choice questions accept selectedChoiceKey");
        }
        attempt.saveText(command.answerText(), now);
    }

    private QuizSession requireSession(long quizId) {
        return sessionRepository.findById(quizId)
                .orElseThrow(() -> new QuizNotFoundException("Quiz session was not found"));
    }

    private int selfCheckPending(QuizSessionData data) {
        return (int) data.attemptsByQuestionId().values().stream()
                .filter(attempt -> attempt.getGradingStatus() == AttemptGradingStatus.SELF_CHECK_REQUIRED)
                .count();
    }

    private QuizSubmissionResult submission(QuizSessionData data) {
        return new QuizSubmissionResult(
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
