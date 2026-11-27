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

/** 자료구조·알고리즘(DSA) 학습 영역의 Concept·Question·SVG 인벤토리와 품질 계약을 검증한다. */
class DsaContentAuditContractTest {
    private static final Path CONTENT = Path.of("../content/dsa");
    private static final Path SVG_DIR = Path.of("../frontend/public/learning/dsa");
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void verifiesDsaInventoryQualityAndSvgCoverage() throws Exception {
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
        for (Path path : concepts) {
            String source = Files.readString(path).replace("\r\n", "\n");
            String key = source.lines().filter(line -> line.startsWith("contentKey: "))
                    .map(line -> line.substring("contentKey: ".length()).trim())
                    .findFirst().orElseThrow();
            assertTrue(conceptKeys.add(key), "Duplicate Concept: " + key);
            assertTrue(key.startsWith("dsa.core."), path.toString());
        }

        long svgFileCount;
        try (Stream<Path> svgs = Files.list(SVG_DIR)) {
            svgFileCount = svgs.filter(p -> p.toString().endsWith(".svg")).count();
        }
        assertTrue(svgFileCount >= 45, "Expected >=45 SVGs, got " + svgFileCount);

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
                    }
                    assertTrue(foundCorrect, "Missing correct choice in " + key);
                }
            }
        }

        assertTrue(totalQuestions >= 350, "Expected >=350 questions, got " + totalQuestions);
        for (String ck : conceptKeys) {
            int qCount = countByConcept.getOrDefault(ck, 0);
            int mcCount = mcByConcept.getOrDefault(ck, 0);
            assertTrue(qCount >= 4, "Expected >=4 questions for " + ck + ", got " + qCount);
            assertTrue(mcCount >= 1, "Expected >=1 MC question for " + ck + ", got " + mcCount);
        }
    }
}
