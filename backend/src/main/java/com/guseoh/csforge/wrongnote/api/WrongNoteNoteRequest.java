package com.guseoh.csforge.wrongnote.api;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 오답 원인 메모 저장 요청이다.
 */
public record WrongNoteNoteRequest(@NotNull @Size(max = 10_000) String content) {
}
