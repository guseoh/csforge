package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/** Network 127 Concept·383 Question의 연결·정답 계약과 ECDHE 수학을 검증한다. */
class NetworkContentAuditContractTest {
    private static final Path CONTENT = Path.of("../content/network-http");
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void verifiesFullNetworkInventoryQuestionLinksAndAnswerContract() throws Exception {
        List<Path> concepts = new ArrayList<>();
        List<Path> questionFiles = new ArrayList<>();
        try (Stream<Path> entries = Files.walk(CONTENT)) {
            entries.filter(Files::isRegularFile).forEach(path -> {
                if (path.toString().endsWith(".md")) concepts.add(path);
                if (path.getFileName().toString().equals("questions.json")) questionFiles.add(path);
            });
        }
        assertEquals(127, concepts.size());
        assertEquals(15, questionFiles.size());

        Set<String> conceptKeys = new HashSet<>();
        int visualizations = 0;
        for (Path path : concepts) {
            String source = Files.readString(path);
            String key = source.lines().filter(line -> line.startsWith("contentKey: "))
                    .map(line -> line.substring("contentKey: ".length()).trim())
                    .findFirst().orElseThrow();
            assertTrue(conceptKeys.add(key), () -> "Duplicate Concept: " + key);
            assertTrue(key.startsWith("network-http.core."), path.toString());
            assertTrue(source.startsWith("---\n"), path.toString());
            assertTrue(source.contains("\n---\n"), path.toString());
            assertTrue(source.contains("references:\n"), path.toString());
            if (source.contains("```csforge-viz")) visualizations++;
        }
        assertEquals(54, visualizations, "53 curriculum diagrams plus one TEXT pilot");

        Set<String> questionKeys = new HashSet<>();
        int questionCount = 0;
        int multipleChoice = 0, descriptive = 0, scenario = 0;
        for (Path path : questionFiles) {
            JsonNode pack = mapper.readTree(Files.readString(path));
            assertTrue(pack.isArray(), path.toString());
            for (JsonNode q : pack) {
                questionCount++;
                String key = q.path("contentKey").asText();
                assertTrue(questionKeys.add(key), () -> "Duplicate Question: " + key);
                assertFalse(q.path("promptMarkdown").asText().isBlank(), key);
                assertFalse(q.path("explanationMarkdown").asText().isBlank(), key);
                assertEquals("PUBLISHED", q.path("status").asText(), key);
                assertEquals(1, q.path("conceptKeys").size(), key);
                String conceptKey = q.path("conceptKeys").get(0).asText();
                assertTrue(conceptKeys.contains(conceptKey), () -> "Orphan Concept: " + key);
                assertTrue(key.startsWith(conceptKey + ".q"), key);
                String type = q.path("questionType").asText();

                switch (type) {
                    case "MULTIPLE_CHOICE" -> {
                        multipleChoice++;
                        JsonNode choices = q.path("choices");
                        assertEquals(4, choices.size(), key);
                        Set<String> names = new HashSet<>();
                        int correctMatches = 0;
                        for (JsonNode choice : choices) {
                            String option = choice.path("key").asText();
                            assertTrue(names.add(option), key);
                            assertFalse(choice.path("content").asText().isBlank(), key);
                            assertFalse(choice.path("rationaleMarkdown").asText().isBlank(), key);
                            if (option.equals(q.path("correctChoiceKey").asText())) correctMatches++;
                        }
                        assertEquals(1, correctMatches, key);
                    }
                    case "DESCRIPTIVE" -> {
                        descriptive++;
                        assertFalse(q.path("modelAnswer").asText().isBlank(), key);
                    }
                    case "SCENARIO" -> {
                        scenario++;
                        assertFalse(q.path("modelAnswer").asText().isBlank(), key);
                    }
                    default -> throw new AssertionError("Unexpected Question type: " + key + ": " + type);
                }
            }
        }
        assertEquals(383, questionCount);
        assertEquals(129, multipleChoice);
        assertEquals(127, descriptive);
        assertEquals(127, scenario);
    }

    @Test
    void ecdheTeachingExampleUsesScalarMultiplication() throws Exception {
        String source = Files.readString(CONTENT.resolve("tls/key-agreement.md"));
        assertTrue(source.contains("A = a·G"));
        assertTrue(source.contains("B = b·G"));
        assertTrue(source.contains("a·B = a·(b·G)"));
        assertTrue(source.contains("b·A = b·(a·G)"));
        assertFalse(source.contains("클라이언트: a + B로 계산"));
        assertFalse(source.contains("서버:       b + A로 계산"));
        assertTrue(source.contains("서로 다른 TLS 연결에 같은 키 공유 정보(KeyShare)를 재사용해서는 안 된다고(MUST NOT)"));
        assertTrue(source.contains("수신 측은 상대가 과거 방식대로 재사용하는 상황 자체는 허용해야 한다(MUST permit)"));
    }
}
