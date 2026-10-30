package com.guseoh.csforge.learning.application;

import java.time.Instant;

/** 개인 Concept 노트 저장 결과를 API와 분리해 전달하는 application view이다. */
public record PersonalNoteView(String content, Instant updatedAt) {
}
