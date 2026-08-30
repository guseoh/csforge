package com.guseoh.csforge.wrongnote.application;

import java.util.List;

/**
 * bounded keyset history 조회 모델이다.
 */
public record WrongNoteAttemptPageView(List<WrongNoteAttemptView> items, String nextCursor) {
}
