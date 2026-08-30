package com.guseoh.csforge.wrongnote.application;

import java.time.Instant;

/**
 * 저장된 개인 오답 원인 메모의 결과 모델이다.
 */
public record WrongNoteNoteView(String content, Instant updatedAt) {
}
