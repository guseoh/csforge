package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import com.guseoh.csforge.importcontent.application.CanonicalBootstrapBatch;
import com.guseoh.csforge.importcontent.application.CanonicalBootstrapBatchPlanner;
import com.guseoh.csforge.importcontent.application.CanonicalBootstrapPlan;
import com.guseoh.csforge.importcontent.application.CanonicalBootstrapService;
import com.guseoh.csforge.importcontent.application.CanonicalContentFile;
import com.guseoh.csforge.importcontent.application.CanonicalContentSource;
import com.guseoh.csforge.importcontent.application.ContentImportPreviewService;
import com.guseoh.csforge.importcontent.application.ContentImportApplyService;
import com.guseoh.csforge.importcontent.application.ImportClassification;
import com.guseoh.csforge.importcontent.application.ImportFilesCommand;
import com.guseoh.csforge.importcontent.application.ImportItemPreview;
import com.guseoh.csforge.importcontent.application.ImportItemKind;
import com.guseoh.csforge.importcontent.application.ImportPreviewResult;
import com.guseoh.csforge.learning.domain.ConceptRepository;
import com.guseoh.csforge.learning.domain.LearningAreaRepository;
import com.guseoh.csforge.learning.domain.TopicRepository;
import com.guseoh.csforge.question.domain.QuestionRepository;
import org.junit.jupiter.api.Test;

/** preview 오류가 있는 bootstrap batch를 apply하지 않는지 검증한다. */
class CanonicalBootstrapServiceTest {
    @Test
    void previewErrorStopsBeforeApply() {
        CanonicalContentSource source = () -> List.of(new CanonicalContentFile("java/topics.json", "{}".getBytes()));
        CanonicalBootstrapBatch batch = new CanonicalBootstrapBatch(1, ImportItemKind.TOPIC,
                new ImportFilesCommand(List.of()), 1);
        CanonicalBootstrapBatchPlanner planner = mock(CanonicalBootstrapBatchPlanner.class);
        when(planner.plan(any())).thenReturn(new CanonicalBootstrapPlan(List.of(batch), 1, 1, 0, 0, 1));
        ContentImportPreviewService preview = mock(ContentImportPreviewService.class);
        when(preview.preview(any())).thenReturn(new ImportPreviewResult("digest", 0, 0, 0, 0, 1,
                List.of(new ImportItemPreview("java/topics.json", 0, ImportItemKind.TOPIC, null,
                        ImportClassification.ERROR, "invalid", List.of(), List.of())), false));
        ContentImportApplyService apply = mock(ContentImportApplyService.class);
        LearningAreaRepository areas = mock(LearningAreaRepository.class);
        TopicRepository topics = mock(TopicRepository.class);
        ConceptRepository concepts = mock(ConceptRepository.class);
        QuestionRepository questions = mock(QuestionRepository.class);
        when(areas.count()).thenReturn(15L);
        when(topics.count()).thenReturn(0L);
        when(concepts.count()).thenReturn(0L);
        when(questions.count()).thenReturn(0L);

        CanonicalBootstrapService service = new CanonicalBootstrapService(source, planner, preview, apply, areas, topics, concepts, questions);
        var result = service.bootstrap();

        assertFalse(result.success());
        assertEquals(1, result.failedBatch());
        assertEquals(1, result.totals().errors());
        verify(apply, never()).apply(any(), any());
    }
}
