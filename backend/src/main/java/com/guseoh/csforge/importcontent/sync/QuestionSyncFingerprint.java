package com.guseoh.csforge.importcontent.sync;

import com.guseoh.csforge.importcontent.application.NormalizedImportItem;
import com.guseoh.csforge.question.domain.Question;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Comparator;
import java.util.HexFormat;

/** Stable fingerprints distinguish canonical source changes from database-only edits. */
public final class QuestionSyncFingerprint {
    private QuestionSyncFingerprint() { }

    public static String source(NormalizedImportItem item) {
        if (item.kind() == null || item.contentKey() == null) throw new IllegalArgumentException("Question identity required");
        return hash(item.toString());
    }

    public static String database(Question question) {
        var value = new StringBuilder();
        append(value, question.getId());
        append(value, question.getContentKey());
        append(value, question.getPromptMarkdown());
        append(value, question.getQuestionType());
        append(value, question.getDifficulty());
        append(value, question.getStatus());
        append(value, question.getExplanationMarkdown());
        question.getChoices().stream().sorted(Comparator.comparing(choice -> choice.getChoiceKey()))
                .forEach(choice -> {
                    append(value, "choice");
                    append(value, choice.getChoiceKey());
                    append(value, choice.getContentMarkdown());
                    append(value, choice.getRationaleMarkdown());
                    append(value, choice.getDisplayOrder());
                });
        question.getAnswers().stream().sorted(Comparator
                .comparing((com.guseoh.csforge.question.domain.QuestionAnswer answer) -> answer.getAnswerKind().name())
                .thenComparing(answer -> answer.getChoice() == null ? "" : answer.getChoice().getChoiceKey())
                .thenComparing(answer -> answer.getAnswerText() == null ? "" : answer.getAnswerText())
                .thenComparingInt(answer -> answer.getDisplayOrder()))
                .forEach(answer -> {
                    append(value, "answer");
                    append(value, answer.getAnswerKind());
                    append(value, answer.getChoice() == null ? null : answer.getChoice().getChoiceKey());
                    append(value, answer.getAnswerText());
                    append(value, answer.getDisplayOrder());
                });
        question.getConceptLinks().stream().map(link -> link.getConcept().getContentKey()).sorted()
                .forEach(key -> { append(value, "concept"); append(value, key); });
        return hash(value.toString());
    }

    private static void append(StringBuilder target, Object value) {
        if (value == null) {
            target.append("N;");
            return;
        }
        String text = value.toString();
        target.append('S').append(text.length()).append(':').append(text).append(';');
    }

    private static String hash(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 unavailable", exception);
        }
    }
}
