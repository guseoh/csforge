package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * Cache 학습 영역의 Concept·Question 인벤토리와 정적 SVG 자산의 무결성 계약을 검증한다.
 */
class CacheContentAuditContractTest {

    private static final Path CONTENT = Path.of("../content/cache");
    private static final Path PUBLIC_DIR = Path.of("../frontend/public");
    private static final Pattern SVG_REF = Pattern.compile("!\\[[^\\]]*]\\((/learning/cache/[^)]+\\.svg)\\)");

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void verifiesCacheInventoryQuestionCoverageAndStaticSvgAssets() throws Exception {
        List<Path> concepts = new ArrayList<>();
        List<Path> questionFiles = new ArrayList<>();
        try (Stream<Path> entries = Files.walk(CONTENT)) {
            entries.filter(Files::isRegularFile).forEach(path -> {
                String name = path.getFileName().toString();
                if (name.endsWith(".md") && !name.startsWith("_")) {
                    concepts.add(path);
                }
                if (name.equals("questions.json")) {
                    questionFiles.add(path);
                }
            });
        }
        AreaContentInventory.assertMatchesDeclaredTopics(CONTENT, concepts, questionFiles);

        Set<String> conceptKeys = new HashSet<>();
        Set<String> referencedSvgs = new HashSet<>();
        for (Path path : concepts) {
            String source = Files.readString(path).replace("\r\n", "\n");
            String key = source.lines()
                    .filter(line -> line.startsWith("contentKey: "))
                    .map(line -> line.substring("contentKey: ".length()).trim())
                    .findFirst()
                    .orElseThrow();
            assertTrue(conceptKeys.add(key), () -> "Duplicate Cache concept: " + key);
            assertTrue(key.startsWith("cache.core."), path.toString());
            assertTrue(source.startsWith("---\n"), path.toString());
            assertTrue(source.contains("\n---\n"), path.toString());
            assertTrue(source.contains("references:\n"), path.toString());

            String frontmatter = source.substring(0, source.indexOf("\n---\n"));
            List<String> urls = frontmatter.lines()
                    .map(String::strip)
                    .filter(line -> line.startsWith("- url:"))
                    .map(line -> line.substring("- url:".length()).trim().replace("\"", ""))
                    .toList();
            assertFalse(urls.isEmpty(), () -> "Missing Reference URL: " + key);
            for (String url : urls) {
                assertTrue(url.startsWith("https://"), () -> "Insecure Reference URL: " + key);
                URI uri = URI.create(url);
                assertFalse(uri.getHost() == null || uri.getHost().isBlank(), () -> "Invalid host: " + key);
            }

            Matcher matcher = SVG_REF.matcher(source);
            int conceptSvgCount = 0;
            while (matcher.find()) {
                conceptSvgCount++;
                String svgWebPath = matcher.group(1);
                referencedSvgs.add(svgWebPath);
                Path svgFile = PUBLIC_DIR.resolve(svgWebPath.substring(1));
                assertTrue(Files.isRegularFile(svgFile), () -> "Missing Cache SVG asset: " + svgFile);
                String svgContent = Files.readString(svgFile);
                assertTrue(svgContent.contains("viewBox="), svgWebPath);
                assertTrue(svgContent.contains("role=\"img\""), svgWebPath);
                assertTrue(svgContent.contains("<title"), svgWebPath);
                assertTrue(svgContent.contains("<desc"), svgWebPath);
                assertFalse(svgContent.contains("<script"), svgWebPath);
                assertFalse(svgContent.contains("<foreignObject"), svgWebPath);
                assertFalse(svgContent.contains("<animate"), svgWebPath);
                assertFalse(svgContent.contains("<iframe"), svgWebPath);
            }
            assertTrue(conceptSvgCount >= 1, () -> "Concept has no static SVG visual: " + key);
        }
        assertEquals(AreaContentInventory.svgAssetPaths(PUBLIC_DIR, "cache"), referencedSvgs,
                "Every area SVG asset must be referenced by a concept");

        Set<String> questionKeys = new HashSet<>();
        Set<String> normalizedPrompts = new HashSet<>();
        Map<String, Integer> questionsPerConcept = new HashMap<>();
        Map<String, Integer> mcPerConcept = new HashMap<>();
        int totalQuestions = 0;
        int codePrompts = 0;

        for (Path path : questionFiles) {
            JsonNode pack = mapper.readTree(Files.readString(path));
            assertTrue(pack.isArray(), path.toString());
            for (JsonNode q : pack) {
                totalQuestions++;
                String key = q.path("contentKey").asText();
                assertTrue(questionKeys.add(key), () -> "Duplicate Question: " + key);
                String prompt = q.path("promptMarkdown").asText();
                assertFalse(prompt.isBlank(), key);
                if (prompt.contains("```")) {
                    codePrompts++;
                }
                String normalized = prompt.replaceAll("\\s+", " ").trim().toLowerCase(Locale.ROOT);
                assertTrue(normalizedPrompts.add(normalized), () -> "Duplicate prompt: " + key);
                assertFalse(q.path("explanationMarkdown").asText().isBlank(), key);
                assertEquals("PUBLISHED", q.path("status").asText(), key);

                JsonNode links = q.path("conceptKeys");
                assertTrue(links.isArray() && !links.isEmpty(), key);
                String type = q.path("questionType").asText();
                for (JsonNode link : links) {
                    String ck = link.asText();
                    assertTrue(conceptKeys.contains(ck), () -> "Orphan Concept: " + key + " -> " + ck);
                    questionsPerConcept.merge(ck, 1, Integer::sum);
                    if ("MULTIPLE_CHOICE".equals(type)) {
                        mcPerConcept.merge(ck, 1, Integer::sum);
                    }
                }

                switch (type) {
                    case "MULTIPLE_CHOICE" -> {
                        JsonNode choices = q.path("choices");
                        assertEquals(4, choices.size(), key);
                        Set<String> optionKeys = new HashSet<>();
                        int matches = 0;
                        for (JsonNode choice : choices) {
                            String opt = choice.path("key").asText();
                            assertTrue(optionKeys.add(opt), key);
                            assertFalse(choice.path("content").asText().isBlank(), key);
                            assertFalse(choice.path("rationaleMarkdown").asText().isBlank(), key);
                            if (opt.equals(q.path("correctChoiceKey").asText())) {
                                matches++;
                            }
                        }
                        assertEquals(1, matches, key);
                    }
                    case "SHORT_ANSWER" -> {
                        JsonNode accepted = q.path("acceptedAnswers");
                        assertTrue(accepted.isArray() && !accepted.isEmpty(), key);
                    }
                    case "DESCRIPTIVE", "SCENARIO" -> assertFalse(q.path("modelAnswer").asText().isBlank(), key);
                    default -> throw new AssertionError("Unexpected questionType: " + key + " -> " + type);
                }
            }
        }

        assertTrue(totalQuestions >= 50, "Expected >=50 questions, got " + totalQuestions);
        assertTrue(codePrompts >= 15, "Expected >=15 code prompts, got " + codePrompts);
        for (String ck : conceptKeys) {
            assertTrue(questionsPerConcept.getOrDefault(ck, 0) >= 5, () -> "Concept has <5 questions: " + ck);
            assertTrue(mcPerConcept.getOrDefault(ck, 0) >= 2, () -> "Concept has <2 MC questions: " + ck);
        }
    }

    @Test
    void sharedCacheReferenceMetadataIsConsistentAcrossConcepts() throws Exception {
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
                        if (url != null) {
                            assertSharedReference(sharedMetadata, firstSource, url, metadata, path);
                        }
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
                if (url != null) {
                    assertSharedReference(sharedMetadata, firstSource, url, metadata, path);
                }
            }
        }
        assertFalse(sharedMetadata.isEmpty());
    }

    private static void assertSharedReference(
            Map<String, Map<String, String>> sharedMetadata,
            Map<String, Path> firstSource,
            String url,
            Map<String, String> metadata,
            Path path) {
        Map<String, String> previous = sharedMetadata.putIfAbsent(url, Map.copyOf(metadata));
        if (previous == null) {
            firstSource.put(url, path);
        } else {
            assertEquals(previous, metadata, () -> "Conflicting globally shared Reference metadata for " + url
                    + " between " + firstSource.get(url) + " and " + path);
        }
    }
}
