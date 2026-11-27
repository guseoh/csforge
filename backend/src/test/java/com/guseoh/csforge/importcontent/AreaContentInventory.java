package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/** 영역별 감사 테스트가 고정 개수 대신 콘텐츠 선언에서 기대 인벤토리를 계산하도록 돕는다. */
final class AreaContentInventory {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private AreaContentInventory() {}

    /** 영역 {@code topics.json}에 선언된 Topic slug 목록이다. */
    static Set<String> declaredTopicSlugs(Path areaDirectory) throws IOException {
        JsonNode topics = OBJECT_MAPPER.readTree(Files.readString(areaDirectory.resolve("topics.json")));
        assertTrue(topics.isArray() && !topics.isEmpty(), () -> "No declared topics: " + areaDirectory);
        Set<String> slugs = new HashSet<>();
        for (JsonNode topic : topics) {
            slugs.add(topic.path("slug").asString());
        }
        return slugs;
    }

    /**
     * 선언된 Topic마다 정확히 하나의 {@code questions.json}이 있고, Concept 파일이 선언된 Topic 폴더에만 있는지 검증한다.
     */
    static void assertMatchesDeclaredTopics(Path areaDirectory, List<Path> concepts, List<Path> questionFiles)
            throws IOException {
        Set<String> topics = declaredTopicSlugs(areaDirectory);
        assertFalse(concepts.isEmpty(), () -> "No concepts: " + areaDirectory);
        assertEquals(topics.size(), questionFiles.size(), "One questions.json per declared topic");
        assertEquals(topics, folderNames(questionFiles), "questions.json folders must match declared topics");
        for (Path concept : concepts) {
            assertTrue(topics.contains(concept.getParent().getFileName().toString()),
                    () -> "Concept outside a declared topic: " + concept);
        }
    }

    /** {@code frontend/public/learning/<area>/}에 있는 SVG 자산의 웹 경로 목록이다. */
    static Set<String> svgAssetPaths(Path publicDirectory, String area) throws IOException {
        try (Stream<Path> files = Files.list(publicDirectory.resolve("learning").resolve(area))) {
            return files.map(path -> path.getFileName().toString())
                    .filter(name -> name.endsWith(".svg"))
                    .map(name -> "/learning/" + area + "/" + name)
                    .collect(Collectors.toSet());
        }
    }

    private static Set<String> folderNames(List<Path> files) {
        return files.stream().map(file -> file.getParent().getFileName().toString()).collect(Collectors.toSet());
    }
}
