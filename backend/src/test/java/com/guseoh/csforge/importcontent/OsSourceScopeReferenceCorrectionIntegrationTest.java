package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import com.guseoh.csforge.importcontent.application.CanonicalBootstrapExecutionResult;
import com.guseoh.csforge.importcontent.application.CanonicalBootstrapService;
import com.guseoh.csforge.importcontent.application.CanonicalContentFile;
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

/** Reference reading-scope corrections preserve link identity and personal learning history. */
@Testcontainers
@SpringBootTest
class OsSourceScopeReferenceCorrectionIntegrationTest {
    private static final String KAKAO_KEY = "operating-systems.core.io.async-io";
    private static final String CGROUP_KEY = "operating-systems.core.isolation.cgroup";
    private static final String KAKAO_PATH = "operating-systems/io/async-io.md";
    private static final String CGROUP_PATH = "operating-systems/isolation/cgroup.md";
    private static final String KAKAO_URL = "https://tech.kakao.com/posts/680";
    private static final String CGROUP_URL = "https://d2.naver.com/helloworld/7248350";
    private static final String OLD_KAKAO = "실시간 messaging server에서 io_uring 도입을 검토하며 syscall/context-switch 비용과 실제 성능을 평가한 사례를 확인한다.";
    private static final String NEW_KAKAO = "실시간 메시징 서버에서 io_uring의 syscall 비용·SQ/CQ·SQPOLL을 검토했지만 Go 런타임 통합 문제로 도입을 보류한 판단 사례로 읽는다.";
    private static final String KAKAO_NOTE = "io_uring 검토 절에서 제출·완료 큐와 SQPOLL의 CPU 사용 절충, 실제 도입을 보류한 이유를 확인한다. 이 글을 io_uring 운영 적용이나 성능 측정 완료의 근거로 읽지 않는다.";
    private static final String CGROUP_NOTE = "이 글의 실습은 cgroups v1의 memory.limit_in_bytes·memory.soft_limit_in_bytes와 Kubernetes request/limit 연결 사례다. Concept의 cgroups v2 memory.max·memory.oom.group의 동작은 이 v1 예제로 확인할 수 없으며 별도 커널 문서를 기준으로 판단한다.";

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            PostgresIntegrationTestSupport.container("csforge_r2_os_source_scope_test");

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
    void correctsTwoReadingGuidesWithoutRecreatingReferencesOrHistory() {
        CanonicalBootstrapExecutionResult initial = bootstrapService.bootstrap();
        assertTrue(initial.success(), () -> "Initial canonical bootstrap: " + initial);
        assertEquals(CanonicalInventory.TOTAL_ITEMS, initial.totalItems());
        assertEquals(0, initial.totals().errors());

        String kafka = canonical(KAKAO_PATH);
        String cgroup = canonical(CGROUP_PATH);
        assertTrue(kafka.contains(NEW_KAKAO) && kafka.contains(KAKAO_NOTE));
        assertTrue(cgroup.contains(CGROUP_NOTE));
        String oldKafka = kafka.replace(NEW_KAKAO, OLD_KAKAO)
                .replace("    relationNote: \"" + KAKAO_NOTE + "\"\n", "");
        String oldCgroup = cgroup.replace("    relationNote: \"" + CGROUP_NOTE + "\"\n", "");
        assertTrue(!oldKafka.equals(kafka) && !oldCgroup.equals(cgroup));
        assertEquals(body(kafka), body(oldKafka));
        assertEquals(body(cgroup), body(oldCgroup));

        long kakaoId = conceptId(KAKAO_KEY);
        long cgroupId = conceptId(CGROUP_KEY);
        long kakaoRef = referenceId(kakaoId, KAKAO_URL);
        long cgroupRef = referenceId(cgroupId, CGROUP_URL);

        ImportFilesCommand old = command(oldKafka, oldCgroup);
        var oldPreview = previewService.preview(old);
        assertTrue(oldPreview.canApply(), () -> "Previous content preview: " + oldPreview);
        assertEquals(0, oldPreview.errors());
        assertEquals(2, oldPreview.updated());
        assertEquals(2, applyService.apply(old, oldPreview.previewDigest()).updated());

        jdbc.update("insert into personal_note (concept_id, content) values (?, 'OS Reference scope history')", kakaoId);
        long qid = jdbc.queryForObject("select id from question order by id limit 1", Long.class);
        long quizId = jdbc.queryForObject(
                "insert into quiz_session (started_at, source) values (current_timestamp, 'STANDARD') returning id",
                Long.class);
        long attemptId = jdbc.queryForObject(
                "insert into attempt (quiz_session_id, question_id, grading_status, correct, answered_at, graded_at) "
                        + "values (?, ?, 'GRADED', false, current_timestamp, current_timestamp) returning id",
                Long.class, quizId, qid);
        jdbc.update("insert into wrong_note (question_id, status, wrong_count, first_wrong_at, last_wrong_at, last_wrong_attempt_id) "
                + "values (?, 'ACTIVE', 1, current_timestamp, current_timestamp, ?)", qid, attemptId);
        List<Map<String, Object>> notesBefore = jdbc.queryForList("select * from personal_note order by id");
        List<Map<String, Object>> attemptsBefore = jdbc.queryForList("select * from attempt order by id");
        List<Map<String, Object>> wrongBefore = jdbc.queryForList("select * from wrong_note order by id");

        ImportFilesCommand updated = command(kafka, cgroup);
        var preview = previewService.preview(updated);
        assertTrue(preview.canApply(), () -> "Corrected preview: " + preview);
        assertEquals(0, preview.errors());
        assertEquals(2, preview.updated());
        assertEquals(2, applyService.apply(updated, preview.previewDigest()).updated());
        assertEquals(kakaoId, conceptId(KAKAO_KEY));
        assertEquals(cgroupId, conceptId(CGROUP_KEY));
        assertEquals(kakaoRef, referenceId(kakaoId, KAKAO_URL));
        assertEquals(cgroupRef, referenceId(cgroupId, CGROUP_URL));
        assertTrue(learningQueryService.getConcept(kakaoId).references().stream()
                .anyMatch(ref -> ref.url().equals(KAKAO_URL) && NEW_KAKAO.equals(ref.recommendation())
                        && KAKAO_NOTE.equals(ref.relationNote())));
        assertTrue(learningQueryService.getConcept(cgroupId).references().stream()
                .anyMatch(ref -> ref.url().equals(CGROUP_URL) && CGROUP_NOTE.equals(ref.relationNote())));
        assertEquals(notesBefore, jdbc.queryForList("select * from personal_note order by id"));
        assertEquals(attemptsBefore, jdbc.queryForList("select * from attempt order by id"));
        assertEquals(wrongBefore, jdbc.queryForList("select * from wrong_note order by id"));

        CanonicalBootstrapExecutionResult repeated = bootstrapService.bootstrap();
        assertTrue(repeated.success(), () -> "Exact canonical reimport: " + repeated);
        assertEquals(CanonicalInventory.TOTAL_ITEMS, repeated.totals().unchanged());
        assertEquals(0, repeated.totals().errors());
        assertEquals(0, repeated.totals().failed());
        assertEquals(kakaoRef, referenceId(kakaoId, KAKAO_URL));
        assertEquals(cgroupRef, referenceId(cgroupId, CGROUP_URL));
        assertEquals(notesBefore, jdbc.queryForList("select * from personal_note order by id"));
        assertEquals(attemptsBefore, jdbc.queryForList("select * from attempt order by id"));
        assertEquals(wrongBefore, jdbc.queryForList("select * from wrong_note order by id"));
    }

    private String canonical(String path) {
        CanonicalContentFile entry = contentSource.load().stream()
                .filter(item -> item.path().equals(path)).findFirst().orElseThrow();
        return new String(entry.content(), StandardCharsets.UTF_8).replace("\r\n", "\n");
    }

    private long conceptId(String key) {
        return jdbc.queryForObject("select id from concept where content_key = ?", Long.class, key);
    }

    private long referenceId(long conceptId, String url) {
        return jdbc.queryForObject(
                "select r.id from concept_reference cr join reference r on r.id=cr.reference_id "
                        + "where cr.concept_id=? and r.url=?",
                Long.class, conceptId, url);
    }

    private static String body(String markdown) {
        return markdown.substring(markdown.indexOf("\n---\n", 4));
    }

    private static ImportFilesCommand command(String kafka, String cgroup) {
        return new ImportFilesCommand(List.of(
                new ImportSourceFile(KAKAO_PATH, kafka.getBytes(StandardCharsets.UTF_8)),
                new ImportSourceFile(CGROUP_PATH, cgroup.getBytes(StandardCharsets.UTF_8))));
    }
}
