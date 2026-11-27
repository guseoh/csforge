package com.guseoh.csforge.importcontent;

import java.util.List;

import com.guseoh.csforge.importcontent.application.CanonicalContentFile;
import com.guseoh.csforge.importcontent.infrastructure.ClasspathCanonicalContentSource;
import tools.jackson.databind.ObjectMapper;

/**
 * 패키징된 canonical content를 import 파서와 독립적으로 세어 import·reference 회귀 테스트의 기준값을 제공한다.
 *
 * <p>콘텐츠가 추가될 때마다 고정 개수를 손으로 갱신하지 않도록, 파일 종류와 JSON 배열 길이만으로 계산한다.
 * Concept는 Markdown 파일 하나, Topic과 Question은 각 JSON 배열의 원소 하나로 센다.
 */
final class CanonicalInventory {
    static final int SOURCE_FILES;
    static final int TOPICS;
    static final int CONCEPTS;
    static final int QUESTIONS;
    static final int TOTAL_ITEMS;

    static {
        List<CanonicalContentFile> files = new ClasspathCanonicalContentSource().load();
        ObjectMapper objectMapper = new ObjectMapper();
        SOURCE_FILES = files.size();
        TOPICS = jsonItemCount(files, "topics.json", objectMapper);
        CONCEPTS = (int) files.stream().filter(file -> file.path().endsWith(".md")).count();
        QUESTIONS = jsonItemCount(files, "questions.json", objectMapper);
        TOTAL_ITEMS = TOPICS + CONCEPTS + QUESTIONS;
    }

    private CanonicalInventory() {}

    private static int jsonItemCount(List<CanonicalContentFile> files, String fileName, ObjectMapper objectMapper) {
        return files.stream()
                .filter(file -> file.path().endsWith("/" + fileName))
                .mapToInt(file -> objectMapper.readTree(file.content()).size())
                .sum();
    }
}
