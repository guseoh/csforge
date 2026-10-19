package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.util.List;

import com.guseoh.csforge.importcontent.application.CanonicalBootstrapService;
import com.guseoh.csforge.importcontent.application.CanonicalContentSource;
import com.guseoh.csforge.importcontent.application.ContentImportApplyService;
import com.guseoh.csforge.importcontent.application.ContentImportPreviewService;
import com.guseoh.csforge.importcontent.application.ImportFilesCommand;
import com.guseoh.csforge.importcontent.application.ImportSourceFile;
import com.guseoh.csforge.learning.application.LearningQueryService;
import com.guseoh.csforge.test.PostgresIntegrationTestSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** CAP 서지 출처를 보존한 원고 추가의 멱등성과 학습 identity·노트 보존을 검증한다. */
@Testcontainers
@SpringBootTest
class CapAuthorManuscriptIntegrationTest {
    private static final String PATH = "distributed-systems/coordination/cap-tradeoffs.md";
    private static final String KEY = "distributed.core.coordination.cap-tradeoffs";
    private static final String DOI = "https://dl.acm.org/doi/10.1145/564585.564601";
    private static final String MIT = "https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer6.pdf";
    private static final String OLD_NOTE = "CAP 절충을 정식화한 논문의 일관성·가용성·네트워크 분할 정의 확인";
    private static final String NEW_NOTE = "출판 서지·DOI 확인용(ACM SIGACT News 33(2), 2002). "
            + "정의·정리 본문은 MIT 저자 원고에서 읽는다. ACM 출판본 전문은 직접 검증하지 못했다.";

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            PostgresIntegrationTestSupport.container("csforge_r2_cap_manuscript");

    @Autowired CanonicalBootstrapService bootstrapService;
    @Autowired CanonicalContentSource contentSource;
    @Autowired ContentImportPreviewService previewService;
    @Autowired ContentImportApplyService applyService;
    @Autowired LearningQueryService learningQueryService;
    @Autowired JdbcTemplate jdbc;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        PostgresIntegrationTestSupport.registerDataSourceProperties(registry, POSTGRES);
    }

    @Test
    void addsReadableManuscriptOnceAndPreservesBibliographyAndLearningState() {
        var first = bootstrapService.bootstrap();
        assertTrue(first.success(), () -> "Bootstrap: " + first);
        assertEquals(3380, first.totalItems());
        assertEquals(0, first.totals().errors());
        String after = new String(contentSource.load().stream().filter(f -> f.path().equals(PATH))
                .findFirst().orElseThrow().content(), StandardCharsets.UTF_8).replace("\r\n", "\n");
        int manuscript = after.indexOf("  - url: \"" + MIT + "\"");
        int boundary = after.indexOf("\n---\n", 4);
        assertTrue(manuscript > 0 && boundary > manuscript);
        String before = (after.substring(0, manuscript).stripTrailing() + after.substring(boundary))
                .replace(NEW_NOTE, OLD_NOTE);
        assertEquals(after.substring(boundary), before.substring(before.indexOf("\n---\n", 4)));
        apply(command(before));

        var conceptIds = jdbc.queryForList("select content_key, id from concept order by id");
        var questionIds = jdbc.queryForList("select content_key, id from question order by id");
        var references = jdbc.queryForList("select url, id from reference order by id");
        long concept = jdbc.queryForObject("select id from concept where content_key=?", Long.class, KEY);
        jdbc.update("insert into personal_note (concept_id, content) values (?, 'CAP private note')", concept);
        var notes = jdbc.queryForList("select * from personal_note order by id");
        var progress = jdbc.queryForList("select * from concept_progress order by concept_id");
        apply(command(after));
        assertEquals(conceptIds, jdbc.queryForList("select content_key, id from concept order by id"));
        assertEquals(questionIds, jdbc.queryForList("select content_key, id from question order by id"));
        assertEquals(references, jdbc.queryForList("select url, id from reference order by id"));
        var shown = learningQueryService.getConcept(concept).references();
        assertEquals(3, shown.size());
        assertTrue(shown.stream().anyMatch(r -> r.url().equals(DOI) && r.relationNote().equals(NEW_NOTE)));
        assertTrue(shown.stream().anyMatch(r -> r.url().equals(MIT) && r.relationNote().contains("§3.1")));
        assertEquals(1, jdbc.queryForObject("select count(*) from concept_reference cr join reference r "
                + "on r.id=cr.reference_id where cr.concept_id=? and r.url=?", Integer.class, concept, MIT));
        var repeatPreview = previewService.preview(command(after));
        assertEquals(1, repeatPreview.unchanged());
        assertEquals(0, repeatPreview.updated());
        var repeat = bootstrapService.bootstrap();
        assertTrue(repeat.success());
        assertEquals(3380, repeat.totals().unchanged());
        assertEquals(0, repeat.totals().errors());
        assertEquals(0, repeat.totals().failed());
        assertEquals(notes, jdbc.queryForList("select * from personal_note order by id"));
        assertEquals(progress, jdbc.queryForList("select * from concept_progress order by concept_id"));
    }

    private void apply(ImportFilesCommand command) {
        var preview = previewService.preview(command);
        assertTrue(preview.canApply(), () -> "Preview: " + preview);
        assertEquals(0, preview.errors());
        assertEquals(1, preview.updated());
        assertEquals(1, applyService.apply(command, preview.previewDigest()).updated());
    }

    private static ImportFilesCommand command(String markdown) {
        return new ImportFilesCommand(List.of(new ImportSourceFile(PATH, markdown.getBytes(StandardCharsets.UTF_8))));
    }
}
