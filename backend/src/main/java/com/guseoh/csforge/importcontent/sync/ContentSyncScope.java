package com.guseoh.csforge.importcontent.sync;

/** 단계적 운영 활성화를 위해 허용 범위를 고정한다. */
public enum ContentSyncScope {
    JAVA_CONCEPTS, JAVA_QUESTIONS, ALL_TOPICS, ALL_CONCEPTS, ALL_QUESTIONS;

    public boolean includes(String path) {
        if (path == null || path.startsWith("/") || path.contains("\\")
                || java.util.Arrays.stream(path.split("/", -1)).anyMatch(p -> p.isEmpty() || p.equals(".") || p.equals(".."))) return false;
        return switch (this) {
            case JAVA_CONCEPTS -> path.startsWith("java/") && path.endsWith(".md");
            case JAVA_QUESTIONS -> path.startsWith("java/") && path.endsWith("/questions.json");
            case ALL_TOPICS -> path.endsWith("/topics.json");
            case ALL_CONCEPTS -> path.endsWith(".md");
            case ALL_QUESTIONS -> path.endsWith("/questions.json");
        };
    }
}
