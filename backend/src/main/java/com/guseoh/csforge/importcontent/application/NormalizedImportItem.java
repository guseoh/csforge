package com.guseoh.csforge.importcontent.application;

import java.util.List;

/** 파일 하나의 canonical upsert 입력과 파싱 오류를 함께 표현한다. */
public record NormalizedImportItem(
        String fileName, int itemIndex, ImportItemKind kind, String contentKey, String areaSlug,
        String topicContentKey, String slug, String title, String description, String summary,
        String contentMarkdown, short level, String status, int displayOrder, boolean active,
        List<NormalizedReference> references, boolean referencesDeclared, String promptMarkdown, String questionType,
        String difficulty, String explanationMarkdown, List<String> conceptKeys,
        List<NormalizedChoice> choices, String correctChoiceKey, List<String> acceptedAnswers,
        String modelAnswer, List<ImportValidationError> errors, String skipReason) {
    public NormalizedImportItem {
        references = references == null ? List.of() : List.copyOf(references);
        conceptKeys = conceptKeys == null ? List.of() : List.copyOf(conceptKeys);
        choices = choices == null ? List.of() : List.copyOf(choices);
        acceptedAnswers = acceptedAnswers == null ? List.of() : List.copyOf(acceptedAnswers);
        errors = errors == null ? List.of() : List.copyOf(errors);
    }
    public boolean isError() { return !errors.isEmpty(); }
    public boolean isSkipped() { return skipReason != null; }

    public boolean sameCanonicalPayload(NormalizedImportItem other) {
        return other != null && kind == other.kind && java.util.Objects.equals(contentKey, other.contentKey)
                && java.util.Objects.equals(areaSlug, other.areaSlug) && java.util.Objects.equals(topicContentKey, other.topicContentKey)
                && java.util.Objects.equals(slug, other.slug) && java.util.Objects.equals(title, other.title)
                && java.util.Objects.equals(description, other.description) && java.util.Objects.equals(summary, other.summary)
                && java.util.Objects.equals(contentMarkdown, other.contentMarkdown) && level == other.level
                && java.util.Objects.equals(status, other.status) && displayOrder == other.displayOrder && active == other.active
                && java.util.Objects.equals(references, other.references) && referencesDeclared == other.referencesDeclared
                && java.util.Objects.equals(promptMarkdown, other.promptMarkdown) && java.util.Objects.equals(questionType, other.questionType)
                && java.util.Objects.equals(difficulty, other.difficulty) && java.util.Objects.equals(explanationMarkdown, other.explanationMarkdown)
                && java.util.Objects.equals(conceptKeys, other.conceptKeys) && java.util.Objects.equals(choices, other.choices)
                && java.util.Objects.equals(correctChoiceKey, other.correctChoiceKey) && java.util.Objects.equals(acceptedAnswers, other.acceptedAnswers)
                && java.util.Objects.equals(modelAnswer, other.modelAnswer);
    }
}
