package com.guseoh.csforge.importcontent.validation;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

/** 선언형 학습 도식의 버전·타입별 필드와 자원 제한을 검증한다. */
@Component
@RequiredArgsConstructor
public class LearningVisualizationValidator {
    public static final int MAX_SOURCE_LENGTH = 12_000;
    private static final Pattern UNSAFE_TEXT = Pattern.compile("[<>\\x00-\\x1f]|javascript:|data:", Pattern.CASE_INSENSITIVE);
    private static final Pattern MEMBER_NAME = Pattern.compile("[가-힣A-Za-z0-9 _.-]{1,12}");
    private final ObjectMapper objectMapper;

    public boolean isValid(String source) {
        if (source == null || source.length() > MAX_SOURCE_LENGTH) return false;
        try {
            Object parsed = objectMapper.readValue(source, Object.class);
            if (!(parsed instanceof Map<?, ?> data) || !integer(data.get("version"), 1, 1)
                    || !text(data.get("title"), 100) || !text(data.get("description"), 600)
                    || !(data.get("type") instanceof String type)) return false;
            return switch (type) {
                case "java-api-contract" -> exactKeys(data, "example")
                        && Set.of("hash-contract", "comparator", "invariance", "pecs", "heap-pollution", "map-views", "list-layout", "hash-lookup", "deque", "iterator", "view-copy", "buffer", "selector").contains(data.get("example"));
                case "static-flow" -> exactKeys(data, "labels")
                        && data.get("labels") instanceof List<?> labels && labels.size() >= 2 && labels.size() <= 6
                        && labels.stream().allMatch(label -> text(label, 40));
                case "java-pass-by-value" -> exactKeys(data, "initialName", "replacementName")
                        && memberName(data.get("initialName")) && memberName(data.get("replacementName"));
                case "min-heap" -> exactKeys(data, "initialValues")
                        && data.get("initialValues") instanceof List<?> values && values.size() <= 15
                        && values.stream().allMatch(value -> integer(value, -99, 99));
                case "tcp-handshake" -> exactKeys(data, "clientIsn", "serverIsn")
                        && integer(data.get("clientIsn"), 0, 4_294_967_295L)
                        && integer(data.get("serverIsn"), 0, 4_294_967_295L);
                case "java-value-reference" -> exactKeys(data, "example")
                        && Set.of("assignment-copy", "final-list", "string-intern").contains(data.get("example"));
                case "java-array-store", "java-definite-assignment" -> exactKeys(data);
                case "java-object-model" -> exactKeys(data, "example")
                        && Set.of("static-members", "initialization", "inheritance", "composition", "dispatch", "casting", "defensive-copy").contains(data.get("example"));
                default -> false;
            };
        } catch (RuntimeException exception) {
            return false;
        }
    }

    private static boolean exactKeys(Map<?, ?> data, String... options) {
        Set<String> keys = new HashSet<>(Set.of("version", "type", "title", "description"));
        keys.addAll(List.of(options));
        return data.keySet().equals(keys);
    }

    private static boolean text(Object value, int maxLength) {
        return value instanceof String text && !text.isBlank() && text.length() <= maxLength
                && !UNSAFE_TEXT.matcher(text).find();
    }

    private static boolean memberName(Object value) {
        return value instanceof String text && !text.isBlank() && MEMBER_NAME.matcher(text).matches();
    }

    private static boolean integer(Object value, long min, long max) {
        if (!(value instanceof Number number)) return false;
        double numeric = number.doubleValue();
        return Double.isFinite(numeric) && numeric == Math.rint(numeric) && numeric >= min && numeric <= max;
    }
}
