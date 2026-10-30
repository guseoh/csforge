package com.guseoh.csforge.importcontent.application;

/** 빌드된 canonical pack 안의 상대 경로와 원문 bytes이다. */
public record CanonicalContentFile(String path, byte[] content) {
    public CanonicalContentFile {
        if (path == null || path.isBlank()) throw new IllegalArgumentException("Canonical content path is required");
        if (content == null) throw new IllegalArgumentException("Canonical content bytes are required");
    }
}
