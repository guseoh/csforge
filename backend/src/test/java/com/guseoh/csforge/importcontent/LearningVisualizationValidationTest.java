package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;
import com.guseoh.csforge.importcontent.validation.LearningVisualizationValidator;
import com.guseoh.csforge.importcontent.validation.VisualizationMarkdownValidator;

/** 프런트엔드와 공유한 도식 계약 및 Markdown fence 검증을 고정한다. */
class LearningVisualizationValidationTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private final LearningVisualizationValidator payloads = new LearningVisualizationValidator(mapper);
    private final VisualizationMarkdownValidator markdown = new VisualizationMarkdownValidator(payloads);
    private static final String VALID = """
            {"version":1,"type":"min-heap","title":"최소 힙","description":"부모 이하 자식","initialValues":[30,10,20]}
            """.strip();

    @Test
    void sharesAllAcceptedAndRejectedPayloadsWithFrontend() throws Exception {
        var cases = mapper.readTree(Files.readString(Path.of("../contracts/learning-visualization-cases.json")));
        for (var sample : cases) {
            assertEquals(sample.get("valid").asBoolean(), payloads.isValid(sample.get("source").asText()), sample.get("name").asText());
        }
        assertFalse(payloads.isValid(" ".repeat(12_001)));
    }

    @Test
    void matchesTheFrontendCommonMarkFenceFixtures() throws Exception {
        var cases = mapper.readTree(Files.readString(Path.of("../contracts/visualization-markdown-cases.json")));
        for (var sample : cases) {
            var errors = markdown.validate(sample.get("source").asText(), "contentMarkdown");
            assertEquals(sample.get("errors").asInt(), errors.size(), sample.get("name").asText());
        }
        String indentedLiteral = "    ```csforge-viz\n    {}\n    ```\n\n";
        assertEquals("contentMarkdown.visualizations[0]", markdown.validate(
                indentedLiteral + "```csforge-viz\n{}\n```", "contentMarkdown").getFirst().path());
    }

    @Test
    void handlesFencesContainersAndLegacyCodeWithoutGlobalBlocking() {
        assertTrue(markdown.validate("```csforge-viz\n" + VALID + "\n```", "body").isEmpty());
        assertTrue(markdown.validate("~~~csforge-viz\n" + VALID + "\n~~~", "body").isEmpty());
        assertTrue(markdown.validate("> ```csforge-viz\n> " + VALID + "\n> ```", "body").isEmpty());
        assertTrue(markdown.validate("- ```csforge-viz\n  " + VALID + "\n  ```", "body").isEmpty());
        assertTrue(markdown.validate("    ```csforge-viz\n    " + VALID + "\n    ```", "body").isEmpty());
        assertTrue(markdown.validate("````text\n```csforge-viz\n{invalid}\n```\n````", "body").isEmpty());
        assertTrue(markdown.validate("```java\nint x = 1;\n```\n**예시**를", "body").isEmpty());
        assertTrue(markdown.validate("`csforge-viz`", "body").isEmpty());
    }

    @Test
    void rejectsInvalidUnclosedOversizedAndExcessiveDeclarations() {
        for (String source : List.of("```csforge-viz\n{}\n```", "```csforge-viz\n" + VALID,
                "```csforge-viz extra\n" + VALID + "\n```", "```csforge-viz\n" + " ".repeat(12_001) + "\n```")) {
            assertFalse(markdown.validate(source, "contentMarkdown").isEmpty());
        }
        assertFalse(markdown.validate(("```csforge-viz\n" + VALID + "\n```\n").repeat(9), "contentMarkdown").isEmpty());
        assertFalse(markdown.validate("- - ```csforge-viz\n    {}\n    ```", "contentMarkdown").isEmpty());
        assertTrue(markdown.validate("    ```csforge-viz\n    {}\n    ```", "contentMarkdown").isEmpty());
        assertEquals("contentMarkdown.visualizations[0]", markdown.validate("```csforge-viz\n{}\n```", "contentMarkdown").getFirst().path());
    }
}
