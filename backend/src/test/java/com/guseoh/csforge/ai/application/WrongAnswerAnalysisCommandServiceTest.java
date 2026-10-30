package com.guseoh.csforge.ai.application;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.Clock;

import com.guseoh.csforge.ai.config.AiAnalysisProperties;
import com.guseoh.csforge.ai.domain.WrongAnswerAnalysisRepository;
import com.guseoh.csforge.wrongnote.domain.WrongNoteRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import tools.jackson.databind.ObjectMapper;

/** provider가 준비되지 않은 요청이 durable job을 만들지 않는 계약을 검증한다. */
class WrongAnswerAnalysisCommandServiceTest {

    private final WrongNoteRepository wrongNoteRepository = mock(WrongNoteRepository.class);
    private final WrongAnswerAnalysisRepository analysisRepository = mock(WrongAnswerAnalysisRepository.class);
    private final WrongAnswerAnalysisSnapshotFactory snapshotFactory = mock(WrongAnswerAnalysisSnapshotFactory.class);
    private final AiAnalysisProperties properties = new AiAnalysisProperties();
    private final ObjectProvider<WrongAnswerAnalyzer> analyzerProvider = mock(ObjectProvider.class);
    private final ObjectMapper objectMapper = mock(ObjectMapper.class);
    private final Clock clock = mock(Clock.class);

    private final WrongAnswerAnalysisCommandService service = new WrongAnswerAnalysisCommandService(
            wrongNoteRepository,
            analysisRepository,
            snapshotFactory,
            properties,
            analyzerProvider,
            objectMapper,
            clock);

    @Test
    void disabledProviderRejectsBeforeLoadingOrCreatingWork() {
        properties.setEnabled(false);

        assertThrows(AiProviderNotConfiguredException.class, () -> service.request(42L));

        verifyNoInteractions(wrongNoteRepository, analysisRepository, snapshotFactory);
    }

    @Test
    void enabledButUnconfiguredProviderRejectsBeforeLoadingOrCreatingWork() {
        properties.setEnabled(true);
        WrongAnswerAnalyzer analyzer = mock(WrongAnswerAnalyzer.class);
        when(analyzer.isConfigured()).thenReturn(false);
        when(analyzerProvider.getIfAvailable()).thenReturn(analyzer);

        assertThrows(AiProviderNotConfiguredException.class, () -> service.request(42L));

        verifyNoInteractions(wrongNoteRepository, analysisRepository, snapshotFactory);
    }
}
