package com.guseoh.csforge.importcontent.application;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionAnswer;
import com.guseoh.csforge.question.domain.QuestionAnswerKind;

/** Import preview와 apply가 Question canonical 구조를 동일하게 비교하도록 한다. */
final class QuestionStructureComparator {

    private QuestionStructureComparator() {
    }

    static boolean matches(NormalizedImportItem item, Question question) {
        return Objects.equals(question.getQuestionType().name(), item.questionType())
                && choiceStructure(question).equals(choiceStructure(item))
                && answerStructure(question).equals(answerStructure(item))
                && conceptKeys(question).equals(item.conceptKeys().stream().sorted().toList());
    }

    private static List<String> choiceStructure(Question question) {
        return question.getChoices().stream()
                .map(choice -> choice.getChoiceKey() + "|" + choice.getContentMarkdown() + "|" + choice.getDisplayOrder())
                .toList();
    }

    private static List<String> choiceStructure(NormalizedImportItem item) {
        return item.choices().stream()
                .map(choice -> choice.key() + "|" + choice.content() + "|" + choice.displayOrder())
                .toList();
    }

    private static List<String> answerStructure(Question question) {
        return question.getAnswers().stream()
                .map(QuestionStructureComparator::answerValue)
                .sorted()
                .toList();
    }

    private static List<String> answerStructure(NormalizedImportItem item) {
        List<String> answers = new ArrayList<>();
        if (item.correctChoiceKey() != null) {
            answers.add(answerValue(QuestionAnswerKind.CORRECT_CHOICE, item.correctChoiceKey(), null));
        }
        item.acceptedAnswers().forEach(answer ->
                answers.add(answerValue(QuestionAnswerKind.ACCEPTED_TEXT, null, answer)));
        if (item.modelAnswer() != null) {
            answers.add(answerValue(QuestionAnswerKind.MODEL_ANSWER, null, item.modelAnswer()));
        }
        return answers.stream().sorted().toList();
    }

    private static String answerValue(QuestionAnswer answer) {
        String choiceKey = answer.getChoice() == null ? null : answer.getChoice().getChoiceKey();
        return answerValue(answer.getAnswerKind(), choiceKey, answer.getAnswerText());
    }

    private static String answerValue(QuestionAnswerKind kind, String choiceKey, String answerText) {
        return kind + "|" + choiceKey + "|" + answerText;
    }

    private static List<String> conceptKeys(Question question) {
        return question.getConceptLinks().stream()
                .map(link -> link.getConcept().getContentKey())
                .sorted()
                .toList();
    }
}
