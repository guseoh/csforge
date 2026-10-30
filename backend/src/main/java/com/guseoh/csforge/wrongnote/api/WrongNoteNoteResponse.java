package com.guseoh.csforge.wrongnote.api;

import java.time.Instant;

/**
 * 저장된 오답 원인 메모의 HTTP 응답이다.
 */
public record WrongNoteNoteResponse(String content, Instant updatedAt) {
}
