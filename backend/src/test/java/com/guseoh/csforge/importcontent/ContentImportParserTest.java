package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.util.List;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;
import com.guseoh.csforge.importcontent.application.ImportFilesCommand;
import com.guseoh.csforge.importcontent.application.ImportItemKind;
import com.guseoh.csforge.importcontent.application.ImportSourceFile;
import com.guseoh.csforge.importcontent.application.NormalizedImportItem;
import com.guseoh.csforge.importcontent.parser.ContentImportParser;

/** import 파일 형식과 구조 검증의 핵심 계약을 고정한다. */
class ContentImportParserTest {
    private final ContentImportParser parser = new ContentImportParser(new ObjectMapper());
    private final com.guseoh.csforge.importcontent.application.ContentImportValidator validator =
            new com.guseoh.csforge.importcontent.application.ContentImportValidator();

    @Test
    void parsesJsonSingleArrayAndMarkdownBody() {
        List<NormalizedImportItem> json = parser.parse(command("items.json", "[{\"kind\":\"topic\",\"contentKey\":\"t1\",\"areaSlug\":\"java\",\"slug\":\"one\",\"title\":\"One\"},{\"kind\":\"topic\",\"contentKey\":\"t2\",\"areaSlug\":\"java\",\"slug\":\"two\",\"title\":\"Two\"}]"));
        List<NormalizedImportItem> markdown = parser.parse(command("concept.md", "---\nkind: concept\ncontentKey: c1\ntopicContentKey: t1\nslug: one\ntitle: One\nlevel: 1\n---\n# Body\n"));

        assertEquals(2, json.size());
        assertEquals(ImportItemKind.TOPIC, json.get(0).kind());
        assertEquals(0, json.get(0).itemIndex());
        assertEquals("# Body", markdown.get(0).contentMarkdown());
    }

    @Test
    void unsupportedMalformedAndMissingRequiredFilesBecomeErrorsOrSkipped() {
        NormalizedImportItem unsupported = parser.parse(command("items.txt", "anything")).get(0);
        NormalizedImportItem malformed = parser.parse(command("items.json", "{not-json")).get(0);
        NormalizedImportItem missing = parser.parse(command("items.json", "{\"kind\":\"topic\"}")).get(0);

        assertTrue(unsupported.isSkipped());
        assertFalse(unsupported.isError());
        assertTrue(malformed.isError());
        assertTrue(missing.isError());
    }

    @Test
    void rejectsConflictingDuplicateAndAllInvalidQuestionStructuresBeforeApply() {
        String base = "{\"kind\":\"question\",\"contentKey\":\"q\",\"promptMarkdown\":\"P\",\"questionType\":\"%s\",\"difficulty\":\"EASY\",\"status\":\"%s\",\"conceptKeys\":[\"c\"]";
        String validMc = base.formatted("MULTIPLE_CHOICE", "PUBLISHED").replace("\"contentKey\":\"q\"", "\"contentKey\":\"mc\"") + ",\"choices\":[{\"key\":\"A\",\"content\":\"A\",\"displayOrder\":0},{\"key\":\"B\",\"content\":\"B\",\"displayOrder\":1}],\"correctChoiceKey\":\"B\"}";
        String validShort = base.formatted("SHORT_ANSWER", "PUBLISHED").replace("\"contentKey\":\"q\"", "\"contentKey\":\"short\"") + ",\"acceptedAnswers\":[\"answer\"]}";
        String validDescriptive = base.formatted("DESCRIPTIVE", "PUBLISHED").replace("\"contentKey\":\"q\"", "\"contentKey\":\"descriptive\"") + ",\"modelAnswer\":\"Explain\"}";
        String validScenario = base.formatted("SCENARIO", "ARCHIVED").replace("\"contentKey\":\"q\"", "\"contentKey\":\"scenario\"") + ",\"modelAnswer\":\"Explain\"}";
        String mc = base.formatted("MULTIPLE_CHOICE", "DRAFT") + ",\"choices\":[{\"key\":\"A\",\"content\":\"A\",\"displayOrder\":0}],\"correctChoiceKey\":\"B\"}";
        String shortAnswer = base.formatted("SHORT_ANSWER", "ARCHIVED") + ",\"choices\":[{\"key\":\"A\",\"content\":\"A\",\"displayOrder\":0}]}";
        String descriptive = base.formatted("DESCRIPTIVE", "DRAFT") + ",\"modelAnswer\":\"   \"}";
        String duplicate = "[{\"kind\":\"topic\",\"contentKey\":\"same\",\"areaSlug\":\"java\",\"slug\":\"one\",\"title\":\"One\"},{\"kind\":\"topic\",\"contentKey\":\"same\",\"areaSlug\":\"java\",\"slug\":\"two\",\"title\":\"Two\"}]";

        List<NormalizedImportItem> invalid = validator.validate(parser.parse(command("questions.json", "[" + mc + "," + shortAnswer + "," + descriptive + "]")));
        List<NormalizedImportItem> valid = validator.validate(parser.parse(command("questions.json", "[" + validMc + "," + validShort + "," + validDescriptive + "," + validScenario + "]")));
        List<NormalizedImportItem> conflicts = validator.validate(parser.parse(command("duplicate.json", duplicate)));

        assertTrue(invalid.stream().allMatch(NormalizedImportItem::isError));
        assertTrue(valid.stream().noneMatch(NormalizedImportItem::isError));
        assertTrue(conflicts.get(1).isError());
    }

    private static ImportFilesCommand command(String name, String content) {
        return new ImportFilesCommand(List.of(new ImportSourceFile(name, content.getBytes(StandardCharsets.UTF_8))));
    }
}
