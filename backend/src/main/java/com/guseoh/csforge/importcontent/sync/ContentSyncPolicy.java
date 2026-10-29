package com.guseoh.csforge.importcontent.sync;

import com.guseoh.csforge.importcontent.application.*;
import java.util.Set;
import org.springframework.stereotype.Component;

/** 자동 반영의 허용 필드를 제한하고 기존 풀이 이력의 의미 변경을 차단한다. */
@Component
public class ContentSyncPolicy {
    private static final Set<String> CONCEPT_FIELDS = Set.of("title", "summary", "contentMarkdown", "references");
    private static final Set<String> QUESTION_FIELDS = Set.of("promptMarkdown", "explanationMarkdown");

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
            if (scope == ContentSyncScope.JAVA_CONCEPTS && item.kind() != ImportItemKind.CONCEPT
                    || scope == ContentSyncScope.JAVA_QUESTIONS && item.kind() != ImportItemKind.QUESTION)
                throw new IllegalStateException("Unexpected item kind");
            if (item.classification() != ImportClassification.UPDATED) continue;
            if (item.kind() == ImportItemKind.CONCEPT) {
                if (item.diffs().stream().anyMatch(d -> !CONCEPT_FIELDS.contains(d.field())))
                    throw new IllegalStateException("Concept relationship/status change requires review");
            } else {
                var question = analysis.state().questions().get(item.contentKey());
                if (question == null || analysis.state().questionIdsWithAttempts().contains(question.getId()))
                    throw new IllegalStateException("Question with attempts requires manual review: " + item.contentKey());
                if (item.diffs().stream().anyMatch(d -> !QUESTION_FIELDS.contains(d.field())))
                    throw new IllegalStateException("Question structure/answer change requires review");
            }
        }
    }
}
