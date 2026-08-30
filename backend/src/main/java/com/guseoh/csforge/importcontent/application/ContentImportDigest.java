package com.guseoh.csforge.importcontent.application;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Comparator;
import java.util.HexFormat;
import com.guseoh.csforge.learning.domain.Concept;
import com.guseoh.csforge.learning.domain.ConceptReference;
import com.guseoh.csforge.learning.domain.Reference;
import com.guseoh.csforge.learning.domain.Topic;
import com.guseoh.csforge.question.domain.Question;

/** 정규화 입력과 관련 canonical 상태를 함께 digest로 고정한다. */
public final class ContentImportDigest {
    private ContentImportDigest() { }

    public static String calculate(java.util.List<NormalizedImportItem> items, ImportState state) {
        StringBuilder value = new StringBuilder();
        items.forEach(item -> value.append(item.toString()).append('\n'));
        state.topics().values().stream().sorted(Comparator.comparing(Topic::getContentKey)).forEach(t -> {
            value.append("T|").append(t.getContentKey()).append('|').append(t.getSlug()).append('|').append(t.getTitle()).append('|').append(t.getDescription()).append('|').append(t.getDisplayOrder()).append('|').append(t.isActive()).append('\n');
        });
        state.concepts().values().stream().sorted(Comparator.comparing(Concept::getContentKey)).forEach(c -> {
            value.append("C|").append(c.getContentKey()).append('|').append(c.getTopic().getContentKey()).append('|').append(c.getSlug()).append('|').append(c.getTitle()).append('|').append(c.getSummary()).append('|').append(c.getContentMarkdown()).append('|').append(c.getLevel()).append('|').append(c.getStatus()).append('|').append(c.getDisplayOrder()).append('\n');
        });
        state.references().values().stream().sorted(Comparator.comparing(Reference::getUrl)).forEach(r -> {
            value.append("R|").append(r.getUrl()).append('|').append(r.getTitle()).append('|').append(r.getReferenceType()).append('|').append(r.getLanguageCode()).append('|').append(r.getDepth()).append('|').append(r.getRecommendation()).append('\n');
        });
        state.questions().values().stream().sorted(Comparator.comparing(Question::getContentKey)).forEach(q -> {
            value.append("Q|").append(q.getContentKey()).append('|').append(q.getPromptMarkdown()).append('|').append(q.getQuestionType()).append('|').append(q.getDifficulty()).append('|').append(q.getStatus()).append('|').append(q.getExplanationMarkdown()).append('\n');
            q.getChoices().forEach(c -> value.append("QC|").append(c.getChoiceKey()).append('|').append(c.getContentMarkdown()).append('|').append(c.getDisplayOrder()).append('\n'));
            q.getAnswers().forEach(a -> value.append("QA|").append(a.getAnswerKind()).append('|').append(a.getChoice() == null ? null : a.getChoice().getChoiceKey()).append('|').append(a.getAnswerText()).append('\n'));
            q.getConceptLinks().stream().map(link -> link.getConcept().getContentKey()).sorted().forEach(key -> value.append("QL|").append(key).append('\n'));
        });
        state.conceptReferences().values().stream().flatMap(java.util.Collection::stream).sorted(Comparator.comparing((ConceptReference link) -> link.getConcept().getContentKey()).thenComparing(link -> link.getReference().getUrl())).forEach(link -> value.append("CR|").append(link.getConcept().getContentKey()).append('|').append(link.getReference().getUrl()).append('|').append(link.getDisplayOrder()).append('|').append(link.getRelationNote()).append('\n'));
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.toString().getBytes(StandardCharsets.UTF_8))); }
        catch (NoSuchAlgorithmException e) { throw new IllegalStateException("SHA-256 is unavailable", e); }
    }
}
