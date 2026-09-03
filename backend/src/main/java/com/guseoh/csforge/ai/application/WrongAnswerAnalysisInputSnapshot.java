package com.guseoh.csforge.ai.application;

import java.util.List;

import com.guseoh.csforge.question.domain.QuestionType;

/** 요청 시점의 canonical 문제, 실제 오답, 정답과 개념을 보존하는 immutable provider 입력이다. */
public record WrongAnswerAnalysisInputSnapshot(
        QuestionSnapshot question,
        List<ChoiceSnapshot> choices,
        UserAnswerSnapshot userAnswer,
        CanonicalAnswerSnapshot canonicalAnswer,
        List<ConceptSnapshot> relatedConcepts) {

    public WrongAnswerAnalysisInputSnapshot {
        choices = List.copyOf(choices == null ? List.of() : choices);
        relatedConcepts = List.copyOf(relatedConcepts == null ? List.of() : relatedConcepts);
    }

    /** provider에 전달하는 Question canonical snapshot이다. */
    public record QuestionSnapshot(
            String contentKey,
            QuestionType questionType,
            String promptMarkdown,
            String explanationMarkdown) {
    }

    /** MCQ choice의 provider snapshot이다. */
    public record ChoiceSnapshot(String choiceKey, String contentMarkdown) {
    }

    /** Attempt가 실제 제출한 답변의 provider snapshot이다. */
    public record UserAnswerSnapshot(String selectedChoiceKey, String answerText) {
    }

    /** Question type에 맞는 canonical 정답의 provider snapshot이다. */
    public record CanonicalAnswerSnapshot(
            String correctChoiceKey,
            List<String> acceptedAnswers,
            String modelAnswer) {

        public CanonicalAnswerSnapshot {
            acceptedAnswers = List.copyOf(acceptedAnswers == null ? List.of() : acceptedAnswers);
        }
    }

    /** provider가 참고할 canonical Concept snapshot이다. */
    public record ConceptSnapshot(String contentKey, String title, String contentMarkdown) {
    }
}
