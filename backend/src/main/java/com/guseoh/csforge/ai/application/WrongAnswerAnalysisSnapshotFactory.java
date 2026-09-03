package com.guseoh.csforge.ai.application;

import java.util.List;
import java.util.Objects;

import com.guseoh.csforge.question.domain.QuestionAnswer;
import com.guseoh.csforge.question.domain.QuestionAnswerKind;
import com.guseoh.csforge.question.domain.QuestionChoice;
import com.guseoh.csforge.question.domain.QuestionChoiceRepository;
import com.guseoh.csforge.question.domain.QuestionConcept;
import com.guseoh.csforge.question.domain.QuestionConceptRepository;
import com.guseoh.csforge.quiz.domain.Attempt;
import com.guseoh.csforge.wrongnote.domain.WrongNote;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** canonical repository와 current wrong Attempt를 요청 시점 snapshot으로 고정한다. */
@Component
@RequiredArgsConstructor
public class WrongAnswerAnalysisSnapshotFactory {

    private final QuestionChoiceRepository choiceRepository;
    private final com.guseoh.csforge.question.domain.QuestionAnswerRepository answerRepository;
    private final QuestionConceptRepository conceptRepository;

    public WrongAnswerAnalysisInputSnapshot create(WrongNote wrongNote) {
        if (wrongNote == null || wrongNote.getQuestion() == null) {
            throw new WrongAnswerAnalysisEligibilityException("Wrong note question is required");
        }
        Attempt attempt = wrongNote.getLastWrongAttempt();
        if (attempt == null) {
            throw new WrongAnswerAnalysisEligibilityException("Wrong note has no latest wrong attempt");
        }
        if (!attempt.isFinalized() || !attempt.isWrong()) {
            throw new WrongAnswerAnalysisEligibilityException("Latest attempt is not a finalized wrong attempt");
        }
        if (attempt.getQuestion() == null
                || !Objects.equals(wrongNote.getQuestion().getId(), attempt.getQuestion().getId())) {
            throw new WrongAnswerAnalysisEligibilityException("Latest attempt does not belong to this question");
        }

        long questionId = wrongNote.getQuestion().getId();
        List<QuestionChoice> choices = choiceRepository.findForQuestionIds(List.of(questionId));
        List<QuestionAnswer> answers = answerRepository.findForQuestionIds(List.of(questionId));
        List<QuestionConcept> conceptLinks = conceptRepository.findForQuestionIds(List.of(questionId));

        return new WrongAnswerAnalysisInputSnapshot(
                new WrongAnswerAnalysisInputSnapshot.QuestionSnapshot(
                        wrongNote.getQuestion().getContentKey(),
                        wrongNote.getQuestion().getQuestionType(),
                        wrongNote.getQuestion().getPromptMarkdown(),
                        wrongNote.getQuestion().getExplanationMarkdown()),
                choices.stream()
                        .map(choice -> new WrongAnswerAnalysisInputSnapshot.ChoiceSnapshot(
                                choice.getChoiceKey(), choice.getContentMarkdown()))
                        .toList(),
                new WrongAnswerAnalysisInputSnapshot.UserAnswerSnapshot(
                        attempt.getSelectedChoice() == null ? null : attempt.getSelectedChoice().getChoiceKey(),
                        attempt.getAnswerText()),
                canonicalAnswer(answers),
                conceptLinks.stream().map(this::toConceptSnapshot).toList());
    }

    private WrongAnswerAnalysisInputSnapshot.CanonicalAnswerSnapshot canonicalAnswer(List<QuestionAnswer> answers) {
        String correctChoiceKey = answers.stream()
                .filter(answer -> answer.getAnswerKind() == QuestionAnswerKind.CORRECT_CHOICE)
                .map(QuestionAnswer::getChoice)
                .filter(Objects::nonNull)
                .map(QuestionChoice::getChoiceKey)
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
        return new WrongAnswerAnalysisInputSnapshot.CanonicalAnswerSnapshot(
                correctChoiceKey, acceptedAnswers, modelAnswer);
    }

    private WrongAnswerAnalysisInputSnapshot.ConceptSnapshot toConceptSnapshot(QuestionConcept link) {
        var concept = link.getConcept();
        return new WrongAnswerAnalysisInputSnapshot.ConceptSnapshot(
                concept.getContentKey(), concept.getTitle(), concept.getContentMarkdown());
    }
}
