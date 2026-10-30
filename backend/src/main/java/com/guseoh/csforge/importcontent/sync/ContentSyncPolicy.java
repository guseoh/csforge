package com.guseoh.csforge.importcontent.sync;

import com.guseoh.csforge.importcontent.application.*;
import java.util.Set;
import org.springframework.stereotype.Component;

/** 자동 반영의 허용 필드를 제한하고 기존 풀이 이력의 의미 변경을 차단한다. */
@Component
public class ContentSyncPolicy {
    private static final Set<String> CONCEPT_FIELDS = Set.of("title", "summary", "contentMarkdown", "references");
    private static final Set<String> QUESTION_FIELDS = Set.of("promptMarkdown", "explanationMarkdown");
    private static final Set<String> TOPIC_FIELDS = Set.of("title", "description", "displayOrder");

    public void validate(ImportAnalysis analysis, ContentSyncScope scope) {
        if (analysis.hasErrors()) throw new IllegalStateException("Preview errors block synchronization");
        for (var input : analysis.items()) {
            for (var ref : input.references()) {
                var old = analysis.state().references().get(ref.url());
                if (old != null && (!java.util.Objects.equals(old.getTitle(), ref.title())
                        || !java.util.Objects.equals(old.getLanguageCode(), ref.language())
                        || !java.util.Objects.equals(old.getReferenceType().name(), ref.referenceType())
                        || !java.util.Objects.equals(old.getDepth(), ref.depth())
                        || !java.util.Objects.equals(old.getRecommendation(), ref.recommendation())))
                    throw new IllegalStateException("Shared reference metadata requires review: " + ref.url());
            }
        }
        for (var item : analysis.previews()) {
            if (item.classification() == ImportClassification.SKIPPED || item.kind() == null)
                throw new IllegalStateException("Skipped input requires review");
            if ((scope == ContentSyncScope.JAVA_CONCEPTS || scope == ContentSyncScope.ALL_CONCEPTS) && item.kind() != ImportItemKind.CONCEPT
                    || (scope == ContentSyncScope.JAVA_QUESTIONS || scope == ContentSyncScope.ALL_QUESTIONS) && item.kind() != ImportItemKind.QUESTION
                    || scope == ContentSyncScope.ALL_TOPICS && item.kind() != ImportItemKind.TOPIC)
                throw new IllegalStateException("Unexpected item kind");
            if (item.classification() != ImportClassification.UPDATED) continue;
            if (item.kind() == ImportItemKind.CONCEPT) {
                if (item.diffs().stream().anyMatch(d -> !CONCEPT_FIELDS.contains(d.field())))
                    throw new IllegalStateException("Concept relationship/status change requires review");
            } else if (item.kind() == ImportItemKind.TOPIC) {
                if (item.diffs().stream().anyMatch(d -> !TOPIC_FIELDS.contains(d.field())))
                    throw new IllegalStateException("Topic identity/status change requires review");
            } else {
                if (!isSafeQuestionUpdate(analysis, item))
                    throw new IllegalStateException("Question update requires manual review: " + item.contentKey());
            }
        }
    }

    public boolean isSafeQuestionUpdate(ImportAnalysis analysis, ImportItemPreview item) {
        if (item.kind() != ImportItemKind.QUESTION || item.classification() != ImportClassification.UPDATED
                || item.diffs().isEmpty() || item.diffs().stream().anyMatch(diff -> !QUESTION_FIELDS.contains(diff.field()))) {
            return false;
        }
        var question = analysis.state().questions().get(item.contentKey());
        return question != null && !analysis.state().questionIdsWithAttempts().contains(question.getId());
    }
}
