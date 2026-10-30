package com.guseoh.csforge.quiz.application;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Objects;
import java.util.UUID;

/** 재시도 요청의 키와 생성 조건을 식별한다. */
public record QuizCreationIdentity(UUID requestId, String fingerprint) {

    public QuizCreationIdentity {
        Objects.requireNonNull(requestId, "requestId is required");
        Objects.requireNonNull(fingerprint, "fingerprint is required");
        if (fingerprint.length() != 64) {
            throw new IllegalArgumentException("fingerprint must be a SHA-256 hex digest");
        }
    }

    public static QuizCreationIdentity forRequest(UUID requestId, String operation, String requestDescription) {
        if (requestId == null) return null;
        Objects.requireNonNull(operation, "operation is required");
        Objects.requireNonNull(requestDescription, "requestDescription is required");
        return new QuizCreationIdentity(requestId, fingerprint(operation + ":" + requestDescription));
    }

    private static String fingerprint(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
