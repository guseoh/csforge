package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/** Java 학습 영역의 Concept·Question·시각화 인벤토리와 품질 계약을 검증한다. */
class JavaContentAuditContractTest {
    private static final Path CONTENT = Path.of("../content/java");
    private static final Path SVG_DIR = Path.of("../frontend/public/learning/java");
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void verifiesJavaInventoryQualityAndVisualizationCoverage() throws Exception {
        List<Path> concepts = new ArrayList<>();
        List<Path> questionFiles = new ArrayList<>();
        try (Stream<Path> entries = Files.walk(CONTENT)) {
            entries.filter(Files::isRegularFile).forEach(path -> {
                if (path.toString().endsWith(".md")) {
                    concepts.add(path);
                }
                if (path.getFileName().toString().equals("questions.json")) {
                    questionFiles.add(path);
                }
            });
        }
        AreaContentInventory.assertMatchesDeclaredTopics(CONTENT, concepts, questionFiles);

        Set<String> conceptKeys = new HashSet<>();
        int vizBlocks = 0;
        for (Path path : concepts) {
            String source = Files.readString(path).replace("\r\n", "\n");
            String key = source.lines().filter(line -> line.startsWith("contentKey: "))
                    .map(line -> line.substring("contentKey: ".length()).trim())
                    .findFirst().orElseThrow();
            assertTrue(conceptKeys.add(key), "Duplicate Concept: " + key);
            assertTrue(key.startsWith("java.core."), path.toString());
            if (source.contains("```csforge-viz")) {
                vizBlocks++;
            }
        }
        assertTrue(vizBlocks >= 85, "Expected >=85 csforge-viz concepts, got " + vizBlocks);

        long svgFileCount;
        try (Stream<Path> svgs = Files.list(SVG_DIR)) {
            svgFileCount = svgs.filter(p -> p.toString().endsWith(".svg")).count();
        }
        assertTrue(svgFileCount >= 27, "Expected >=27 SVGs, got " + svgFileCount);

        Set<String> questionKeys = new HashSet<>();
        Set<String> normalizedPrompts = new HashSet<>();
        Map<String, Integer> countByConcept = new HashMap<>();
        int totalQuestions = 0;
        int scenarioOrDescriptive = 0;
        int codePrompts = 0;

        for (Path path : questionFiles) {
            JsonNode pack = mapper.readTree(Files.readString(path));
            assertTrue(pack.isArray(), path.toString());
            for (JsonNode q : pack) {
                totalQuestions++;
                String key = q.path("contentKey").asString();
                assertTrue(questionKeys.add(key), "Duplicate Question: " + key);
                String rawPrompt = q.path("promptMarkdown").asString();
                if (rawPrompt.contains("```")) {
                    codePrompts++;
                }
                String prompt = rawPrompt.replaceAll("\\s+", " ").trim().toLowerCase(Locale.ROOT);
                assertFalse(prompt.isBlank(), key);
                assertTrue(normalizedPrompts.add(prompt), "Duplicate Question prompt: " + key);
                assertFalse(q.path("explanationMarkdown").asString().isBlank(), key);
                assertEquals("PUBLISHED", q.path("status").asString(), key);
                assertTrue(q.path("conceptKeys").size() >= 1, key);
                for (JsonNode ckNode : q.path("conceptKeys")) {
                    String ck = ckNode.asString();
                    assertTrue(conceptKeys.contains(ck), "Unknown Concept: " + ck + " in " + key);
                    countByConcept.merge(ck, 1, Integer::sum);
                }
                String type = q.path("questionType").asString();
                if ("SCENARIO".equals(type) || "DESCRIPTIVE".equals(type)) {
                    scenarioOrDescriptive++;
                    assertFalse(q.path("modelAnswer").asString().isBlank(), "Missing modelAnswer in " + key);
                }
            }
        }

        assertTrue(totalQuestions >= 862, "Expected >=862 questions, got " + totalQuestions);
        assertTrue(scenarioOrDescriptive >= 92, "Expected >=92 SCENARIO/DESCRIPTIVE, got " + scenarioOrDescriptive);
        assertTrue(codePrompts >= 138, "Expected >=138 code prompts, got " + codePrompts);
        for (String ck : conceptKeys) {
            int qCount = countByConcept.getOrDefault(ck, 0);
            assertTrue(qCount >= 4, "Expected >=4 questions for " + ck + ", got " + qCount);
        }
    }
}
