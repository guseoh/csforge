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

/** 시스템 설계 학습 영역의 Concept·Question·SVG 인벤토리와 품질 계약을 검증한다. */
class SystemDesignContentAuditContractTest {
    private static final Path CONTENT = Path.of("../content/system-design");
    private static final Path SVG_DIR = Path.of("../frontend/public/learning/system-design");
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void verifiesSystemDesignInventoryQualityAndSvgCoverage() throws Exception {
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
        assertEquals(10, concepts.size());
        assertEquals(3, questionFiles.size());

        Set<String> conceptKeys = new HashSet<>();
        int conceptsWithSvg = 0;
        for (Path path : concepts) {
            String source = Files.readString(path).replace("\r\n", "\n");
            String key = source.lines().filter(line -> line.startsWith("contentKey: "))
                    .map(line -> line.substring("contentKey: ".length()).trim())
                    .findFirst().orElseThrow();
            assertTrue(conceptKeys.add(key), "Duplicate Concept: " + key);
            assertTrue(key.startsWith("system-design.core."), path.toString());
            if (source.contains("/learning/system-design/") && source.contains(".svg")) {
                conceptsWithSvg++;
            }
        }
        assertEquals(10, conceptsWithSvg, "All 10 concepts must include static SVG diagrams");

        long svgFileCount;
        try (Stream<Path> svgs = Files.list(SVG_DIR)) {
            svgFileCount = svgs.filter(p -> p.toString().endsWith(".svg")).count();
        }
        assertTrue(svgFileCount >= 11, "Expected >=11 SVGs, got " + svgFileCount);

        Set<String> questionKeys = new HashSet<>();
        Set<String> normalizedPrompts = new HashSet<>();
        Map<String, Integer> countByConcept = new HashMap<>();
        Map<String, Integer> mcByConcept = new HashMap<>();
        int totalQuestions = 0;

        for (Path path : questionFiles) {
            JsonNode pack = mapper.readTree(Files.readString(path));
            assertTrue(pack.isArray(), path.toString());
            for (JsonNode q : pack) {
                totalQuestions++;
                String key = q.path("contentKey").asString();
                assertTrue(questionKeys.add(key), "Duplicate Question: " + key);
                String prompt = q.path("promptMarkdown").asString().replaceAll("\\s+", " ")
                        .trim().toLowerCase(Locale.ROOT);
                assertFalse(prompt.isBlank(), key);
                assertTrue(normalizedPrompts.add(prompt), "Duplicate Question prompt: " + key);
                assertFalse(q.path("explanationMarkdown").asString().isBlank(), key);
                assertEquals("PUBLISHED", q.path("status").asString(), key);
                assertTrue(q.path("conceptKeys").size() >= 1, key);
                for (JsonNode ckNode : q.path("conceptKeys")) {
                    String ck = ckNode.asString();
                    assertTrue(conceptKeys.contains(ck), "Unknown Concept: " + ck + " in " + key);
                    countByConcept.merge(ck, 1, Integer::sum);
                    if ("MULTIPLE_CHOICE".equals(q.path("questionType").asString())) {
                        mcByConcept.merge(ck, 1, Integer::sum);
                    }
                }
                if ("MULTIPLE_CHOICE".equals(q.path("questionType").asString())) {
                    assertEquals(4, q.path("choices").size(), key);
                    String correctKey = q.path("correctChoiceKey").asString();
                    boolean foundCorrect = false;
                    for (JsonNode choice : q.path("choices")) {
                        if (correctKey.equals(choice.path("key").asString())) {
                            foundCorrect = true;
                        }
                        if (key.endsWith(".q4") || key.endsWith(".q5")) {
                            assertTrue(choice.path("rationaleMarkdown").asString().length() >= 35,
                                    "Short rationale in " + key + ":" + choice.path("key").asString());
                        }
                    }
                    assertTrue(foundCorrect, "Missing correct choice in " + key);
                }
            }
        }

        assertEquals(50, totalQuestions);
        for (String ck : conceptKeys) {
            int qCount = countByConcept.getOrDefault(ck, 0);
            int mcCount = mcByConcept.getOrDefault(ck, 0);
            assertTrue(qCount >= 5, "Expected >=5 questions for " + ck + ", got " + qCount);
            assertTrue(mcCount >= 2, "Expected >=2 MC questions for " + ck + ", got " + mcCount);
        }
    }
}
