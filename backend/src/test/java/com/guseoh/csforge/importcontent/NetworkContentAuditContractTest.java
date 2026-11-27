package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Files;
import java.nio.file.Path;
import java.net.URI;
import java.util.Locale;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/** Network 학습 영역 Concept·Question의 연결·정답 계약과 ECDHE 수학을 검증한다. */
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
        AreaContentInventory.assertMatchesDeclaredTopics(CONTENT, concepts, questionFiles);

        Set<String> conceptKeys = new HashSet<>();
        int visualizations = 0;
        for (Path path : concepts) {
            String source = Files.readString(path).replace("\r\n", "\n");
            String key = source.lines().filter(line -> line.startsWith("contentKey: "))
                    .map(line -> line.substring("contentKey: ".length()).trim())
                    .findFirst().orElseThrow();
            assertTrue(conceptKeys.add(key), () -> "Duplicate Concept: " + key);
            assertTrue(key.startsWith("network-http.core."), path.toString());
            assertTrue(source.startsWith("---\n"), path.toString());
            assertTrue(source.contains("\n---\n"), path.toString());
            assertTrue(source.contains("references:\n"), path.toString());
            String frontmatter = source.substring(0, source.indexOf("\n---\n"));
            List<String> urls = frontmatter.lines()
                    .map(String::strip)
                    .filter(line -> line.startsWith("- url:"))
                    .map(line -> line.substring("- url:".length()).trim().replace("\"", ""))
                    .toList();
            assertFalse(urls.isEmpty(), () -> "Missing Concept Reference URL: " + key);
            for (String url : urls) {
                assertTrue(url.startsWith("https://"), () -> "Insecure Reference URL: " + key);
                URI uri = URI.create(url);
                assertFalse(uri.getHost() == null || uri.getHost().isBlank(), () -> "Invalid Reference host: " + key);
            }
            if (source.contains("```csforge-viz")) visualizations++;
        }
        // G1에서 확정한 53개 curriculum 도식과 TEXT pilot 1개는 유지되어야 하며, 이후 추가는 허용한다.
        assertTrue(visualizations >= 54, "Expected >=54 visualizations, got " + visualizations);

        Set<String> questionKeys = new HashSet<>();
        Set<String> normalizedQuestions = new HashSet<>();
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
                String prompt = q.path("promptMarkdown").asText().replaceAll("\\s+", " ")
                        .trim().toLowerCase(Locale.ROOT);
                assertTrue(normalizedQuestions.add(prompt), () -> "Duplicate Question prompt: " + key);
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
        // 각 Concept은 서술형·시나리오를 하나씩, 객관식을 하나 이상 가진다.
        assertEquals(concepts.size(), descriptive);
        assertEquals(concepts.size(), scenario);
        assertTrue(multipleChoice >= concepts.size(), "Expected >=1 MC per concept, got " + multipleChoice);
        assertEquals(multipleChoice + descriptive + scenario, questionCount);
    }

    @Test
    void sharedNetworkReferenceMetadataIsConsistentAcrossConcepts() throws Exception {
        Map<String, Map<String, String>> sharedMetadata = new HashMap<>();
        Map<String, Path> firstSource = new HashMap<>();
        try (Stream<Path> entries = Files.walk(CONTENT)) {
            for (Path path : entries.filter(file -> Files.isRegularFile(file)
                    && file.toString().endsWith(".md")).toList()) {
                String source = Files.readString(path).replace("\r\n", "\n");
                String frontmatter = source.substring(0, source.indexOf("\n---\n"));
                String url = null;
                Map<String, String> metadata = null;

                for (String line : frontmatter.split("\n")) {
                    String field = line.strip();
                    if (line.startsWith("  - url: ")) {
                        if (url != null) assertSharedReference(sharedMetadata, firstSource, url, metadata, path);
                        url = field.substring("- url: ".length()).replace("\"", "");
                        metadata = new HashMap<>();
                    } else if (url != null && line.startsWith("    ")) {
                        int delimiter = field.indexOf(':');
                        if (delimiter > 0) {
                            String name = field.substring(0, delimiter);
                            if (Set.of("title", "referenceType", "language", "depth", "recommendation").contains(name)) {
                                metadata.put(name, field.substring(delimiter + 1).trim());
                            }
                        }
                    }
                }
                if (url != null) assertSharedReference(sharedMetadata, firstSource, url, metadata, path);
            }
        }
        assertFalse(sharedMetadata.isEmpty());
    }

    private static void assertSharedReference(Map<String, Map<String, String>> sharedMetadata,
            Map<String, Path> firstSource, String url, Map<String, String> metadata, Path path) {
        Map<String, String> previous = sharedMetadata.putIfAbsent(url, Map.copyOf(metadata));
        if (previous == null) {
            firstSource.put(url, path);
        } else {
            assertEquals(previous, metadata, () -> "Conflicting globally shared Reference metadata for " + url
                    + " between " + firstSource.get(url) + " and " + path
                    + "; keep displayOrder/relationNote concept-local");
        }
    }

    @Test
    void http2WindowExplanationRetainsZeroLengthEndStreamException() throws Exception {
        String concept = Files.readString(CONTENT.resolve("http-versions/http2-multiplexing.md"));
        assertTrue(concept.contains("0바이트 END_STREAM DATA")
                || concept.contains("길이 0이고 `END_STREAM`이 설정된 DATA 프레임"));
        JsonNode pack = mapper.readTree(Files.readString(CONTENT.resolve("http-versions/questions.json")));
        JsonNode scenario = null;
        for (JsonNode question : pack) {
            if ("network-http.core.http-versions.http2-multiplexing.q3"
                    .equals(question.path("contentKey").asText())) {
                scenario = question;
                break;
            }
        }
        assertTrue(scenario != null, "HTTP/2 multiplexing scenario is missing");
        String modelAnswer = scenario.path("modelAnswer").asText();
        assertTrue(modelAnswer.contains("길이가 0이며 END_STREAM이 설정된 DATA 프레임")
                || modelAnswer.contains("TCP 순서가 보장된 바이트 스트림"));
    }

    @Test
    void ecdheTeachingExampleUsesScalarMultiplication() throws Exception {
        String source = Files.readString(CONTENT.resolve("tls/key-agreement.md"));
        assertTrue(source.contains("A=aG") || source.contains("A = a·G"));
        assertTrue(source.contains("B=bG") || source.contains("B = b·G"));
        assertTrue(source.contains("aB") || source.contains("a·B = a·(b·G)"));
        assertTrue(source.contains("bA") || source.contains("b·A = b·(a·G)"));
        assertFalse(source.contains("클라이언트: a + B로 계산"));
        assertFalse(source.contains("서버:       b + A로 계산"));
        assertTrue(source.contains("서로 다른 TLS 연결에 같은 키 공유 정보(KeyShare)를 재사용해서는 안 되")
                && source.contains("MUST NOT"));
        assertTrue(source.contains("MUST permit"));
    }
}
