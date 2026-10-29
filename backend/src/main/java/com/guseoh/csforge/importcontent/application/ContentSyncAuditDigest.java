package com.guseoh.csforge.importcontent.application;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Comparator;
import java.util.HexFormat;

/** 정렬된 파일 경로와 byte hash로 원본 범위를 식별한다. */
public final class ContentSyncAuditDigest {
    private ContentSyncAuditDigest() { }
    public static String calculate(java.util.List<CanonicalContentFile> files) {
        try {
            var sha = MessageDigest.getInstance("SHA-256");
            for (var file : files.stream().sorted(Comparator.comparing(CanonicalContentFile::path)).toList()) {
                sha.update(file.path().getBytes(StandardCharsets.UTF_8));
                sha.update((byte) 0);
                sha.update(MessageDigest.getInstance("SHA-256").digest(file.content()));
            }
            return HexFormat.of().formatHex(sha.digest());
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 unavailable", exception);
        }
    }
}
