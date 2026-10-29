package com.guseoh.csforge.importcontent.sync;

/** 단계적 운영 활성화를 위해 허용 범위를 고정한다. */
public enum ContentSyncScope {
    JAVA_CONCEPTS, JAVA_QUESTIONS;

    public boolean includes(String path) {
        return path.startsWith("java/") && (this == JAVA_CONCEPTS ? path.endsWith(".md") : path.endsWith("/questions.json"));
    }
}
