package com.guseoh.csforge.ai.application;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Component;

/** structured provider result를 CSForge 학습 계약과 snapshot allow-list에 맞게 검증한다. */
@Component
public class WrongAnswerAnalysisResultValidator {

    private static final int MAX_EXPLANATION_LENGTH = 4_000;
    private static final int MAX_MISSED_CONCEPTS = 3;
    private static final int MAX_MISSED_CONCEPT_LENGTH = 200;
    private static final int MAX_RELATED_CONCEPTS = 5;
    private static final int MAX_FOLLOW_UP_QUESTIONS = 2;
    private static final int MAX_FOLLOW_UP_LENGTH = 500;

    public WrongAnswerAnalysisResult validate(
            WrongAnswerAnalysisResult result,
            WrongAnswerAnalysisInputSnapshot snapshot) {
        if (result == null || snapshot == null) throw invalid("result and snapshot are required");
        String whyWrong = requiredText(result.whyWrong(), "whyWrong", MAX_EXPLANATION_LENGTH);
        String correctUnderstanding = requiredText(
                result.correctUnderstanding(), "correctUnderstanding", MAX_EXPLANATION_LENGTH);
        List<String> missedConcepts = requiredList(
                result.missedConcepts(), "missedConcepts", 1, MAX_MISSED_CONCEPTS, MAX_MISSED_CONCEPT_LENGTH);
        List<String> followUpQuestions = requiredList(
                result.followUpQuestions(), "followUpQuestions", 1, MAX_FOLLOW_UP_QUESTIONS, MAX_FOLLOW_UP_LENGTH);
        List<String> relatedConceptKeys = requiredList(
                result.relatedConceptKeys(), "relatedConceptKeys", 0, MAX_RELATED_CONCEPTS, 160);

        Set<String> allowedConceptKeys = snapshot.relatedConcepts().stream()
                .map(WrongAnswerAnalysisInputSnapshot.ConceptSnapshot::contentKey)
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
        for (String key : relatedConceptKeys) {
            if (!allowedConceptKeys.contains(key)) {
                throw invalid("relatedConceptKey is not present in the input snapshot");
            }
        }
        if (new HashSet<>(relatedConceptKeys).size() != relatedConceptKeys.size()) {
            throw invalid("relatedConceptKeys must be unique");
        }
        return new WrongAnswerAnalysisResult(
                whyWrong, missedConcepts, correctUnderstanding, relatedConceptKeys, followUpQuestions);
    }

    private static List<String> requiredList(
            List<String> values,
            String name,
            int minimum,
            int maximum,
            int memberMaximum) {
        if (values == null || values.size() < minimum || values.size() > maximum) {
            throw invalid(name + " has an invalid number of items");
        }
        return values.stream().map(value -> requiredText(value, name + " member", memberMaximum)).toList();
    }

    private static String requiredText(String value, String name, int maximum) {
        if (value == null || value.isBlank() || value.length() > maximum) {
            throw invalid(name + " is blank or too long");
        }
        return value.trim();
    }

    private static WrongAnswerAnalysisInvalidOutputException invalid(String message) {
        return new WrongAnswerAnalysisInvalidOutputException(message);
    }
}
