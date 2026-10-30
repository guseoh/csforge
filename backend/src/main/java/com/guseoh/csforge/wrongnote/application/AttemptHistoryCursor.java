package com.guseoh.csforge.wrongnote.application;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

import com.guseoh.csforge.quiz.domain.Attempt;

/** 오답 시도 history의 keyset pagination 위치를 표현한다. */
record AttemptHistoryCursor(Instant at, long id) {

    static AttemptHistoryCursor decode(String value) {
        if (value == null || value.isBlank()) {
            return new AttemptHistoryCursor(null, 0);
        }
        try {
            String decoded = new String(Base64.getUrlDecoder().decode(value), StandardCharsets.UTF_8);
            String[] parts = decoded.split(",", 2);
            return new AttemptHistoryCursor(Instant.parse(parts[0]), Long.parseLong(parts[1]));
        } catch (RuntimeException exception) {
            throw new IllegalArgumentException("Invalid cursor");
        }
    }

    static String encode(Attempt attempt) {
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString((attempt.getUpdatedAt() + "," + attempt.getId()).getBytes(StandardCharsets.UTF_8));
    }
}
