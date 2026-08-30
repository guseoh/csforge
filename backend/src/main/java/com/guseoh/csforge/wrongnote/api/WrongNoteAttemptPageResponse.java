package com.guseoh.csforge.wrongnote.api;

import java.util.List;

/**
 * 오답 history keyset 페이지의 HTTP 응답이다.
 */
public record WrongNoteAttemptPageResponse(List<WrongNoteAttemptResponse> items, String nextCursor) {
}
