package com.guseoh.csforge.ai.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Instant;

import com.guseoh.csforge.quiz.domain.Attempt;
import com.guseoh.csforge.wrongnote.domain.WrongNote;
import org.junit.jupiter.api.Test;

/** 오답 분석 lifecycle의 정상 전이, bounded retry와 ownership을 검증한다. */
class WrongAnswerAnalysisTest {

    private static final Instant NOW = Instant.parse("2026-09-03T00:00:00Z");

    @Test
    void completesOnlyForTheCurrentProcessingOwner() {
        Attempt attempt = wrongAttempt(7L);
        WrongNote note = mock(WrongNote.class);
        when(note.getLastWrongAttempt()).thenReturn(attempt);
        WrongAnswerAnalysis analysis = pending(note, attempt);

        analysis.claim("owner-a", NOW);
        assertFalse(analysis.ownsProcessing("owner-b"));
        assertThrows(IllegalStateException.class, () -> analysis.complete("owner-b", "{}", NOW));
        analysis.complete("owner-a", "{\"whyWrong\":\"because\"}", NOW);

        assertEquals(WrongAnswerAnalysisStatus.COMPLETED, analysis.getStatus());
        assertFalse(analysis.ownsProcessing("owner-a"));
    }

    @Test
    void retriesTransientFailuresAndExhaustsAtTheConfiguredBound() {
        Attempt attempt = wrongAttempt(8L);
        WrongNote note = mock(WrongNote.class);
        when(note.getLastWrongAttempt()).thenReturn(attempt);
        WrongAnswerAnalysis analysis = pending(note, attempt);

        analysis.claim("owner-1", NOW);
        analysis.fail("owner-1", "AI_PROVIDER_UNAVAILABLE", "unavailable", true, 3, NOW, NOW.plusSeconds(1));
        assertEquals(WrongAnswerAnalysisStatus.PENDING, analysis.getStatus());
        analysis.claim("owner-2", NOW.plusSeconds(1));
        analysis.fail("owner-2", "AI_PROVIDER_UNAVAILABLE", "unavailable", true, 3, NOW, NOW.plusSeconds(2));
        analysis.claim("owner-3", NOW.plusSeconds(2));
        analysis.fail("owner-3", "AI_PROVIDER_UNAVAILABLE", "unavailable", true, 3, NOW, null);

        assertEquals(WrongAnswerAnalysisStatus.FAILED, analysis.getStatus());
        analysis.retry(NOW.plusSeconds(3));
        assertEquals(WrongAnswerAnalysisStatus.PENDING, analysis.getStatus());
        assertEquals(0, analysis.getProcessingAttemptCount());
    }

    @Test
    void reclaimsStaleProcessingWithANewTokenAndIgnoresLateCompletion() {
        Attempt attempt = wrongAttempt(9L);
        WrongNote note = mock(WrongNote.class);
        when(note.getLastWrongAttempt()).thenReturn(attempt);
        WrongAnswerAnalysis analysis = pending(note, attempt);

        analysis.claim("owner-a", NOW);
        Instant staleBefore = NOW.plusSeconds(1);
        assertTrue(analysis.isRunnable(staleBefore, staleBefore));
        analysis.reclaim("owner-b", staleBefore, staleBefore);
        assertFalse(analysis.ownsProcessing("owner-a"));
        assertTrue(analysis.ownsProcessing("owner-b"));
        assertThrows(IllegalStateException.class, () -> analysis.complete("owner-a", "{}", staleBefore));
        analysis.complete("owner-b", "{}", staleBefore);
        assertEquals(WrongAnswerAnalysisStatus.COMPLETED, analysis.getStatus());
    }

    private static WrongAnswerAnalysis pending(WrongNote note, Attempt attempt) {
        return WrongAnswerAnalysis.pending(note, attempt, "{}", "ollama", "llama3.2", "v1", "v1", NOW);
    }

    private static Attempt wrongAttempt(long id) {
        Attempt attempt = mock(Attempt.class);
        when(attempt.getId()).thenReturn(id);
        when(attempt.isWrong()).thenReturn(true);
        return attempt;
    }
}
