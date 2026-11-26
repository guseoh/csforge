package com.guseoh.csforge.importcontent.sync;

import static org.junit.jupiter.api.Assertions.*;

import com.guseoh.csforge.importcontent.application.*;
import com.guseoh.csforge.importcontent.infrastructure.ClasspathCanonicalContentSource;
import com.guseoh.csforge.test.PostgresIntegrationTestSupport;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** 운영 사고 #300의 공유 Reference 변경과 소스 내 충돌을 격리 PostgreSQL에서 회귀 검증한다. */
@SpringBootTest
@Testcontainers
class ContentSyncSharedReferenceRegressionTest {
    @Container
    static final PostgreSQLContainer<?> DB =
            PostgresIntegrationTestSupport.container("sync_reference_regression");

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        PostgresIntegrationTestSupport.registerDataSourceProperties(registry, DB);
    }

    private static final String OLD_SHA = "5a6757545a0ee16b845c5a83924e4b1b9e7840e9";
    private static final String NEW_SHA = "425872f7c64cbddf214954e102f2e419adab229f";
    private static final String OLD = "SameSite 등 최신 쿠키 동작을 다루지만 2026-10-17 현재 발행 전의 변경 가능한 초안이다.";
    private static final String NEW = "SameSite 등 최신 쿠키 동작을 다루는 변경 가능한 Internet-Draft이다. 2026-11-08에 발행 상태를 확인했으며, 읽을 때 새 정식 RFC 발행 여부를 다시 점검한다.";
    private static final String URL = "https://httpwg.org/http-extensions/draft-ietf-httpbis-rfc6265bis.html";
    private static final String PREFIX = "network-http/http-state-intermediary/";

    @Autowired ContentSyncService sync;
    @Autowired ContentImportPreviewService preview;
    @Autowired ContentImportApplyService apply;
    @Autowired ClasspathCanonicalContentSource packaged;
    @Autowired AtomicReference<List<CanonicalContentFile>> input;
    @Autowired JdbcTemplate jdbc;

    @TestConfiguration
    static class Source {
        @Bean
        AtomicReference<List<CanonicalContentFile>> syncInput() {
            return new AtomicReference<>(List.of());
        }

        @Bean
        @Primary
        CanonicalContentSource testSource(AtomicReference<List<CanonicalContentFile>> source) {
            return source::get;
        }
    }

    @Test
    void changedSharedReferenceAndSourceConflictBlockAtomicallyWhileReviewedBodyOnlyConverges() {
        var files = packaged.load();
        var topic = files.stream().filter(f -> f.path().equals("network-http/topics.json"))
                .findFirst().orElseThrow();
        var templates = files.stream().filter(f -> List.of(
                PREFIX + "cookie.md",
                PREFIX + "cookie-scope.md",
                PREFIX + "set-cookie.md").contains(f.path())).toList();
        assertEquals(3, templates.size());

        var previous = templates.stream().map(f -> withRecommendation(f, OLD)).toList();
        var current = templates.stream().map(f -> withRecommendation(f, NEW)).toList();
        var inconsistent = templates.stream()
                .map(f -> f.path().endsWith("/cookie.md") ? withRecommendation(f, NEW) : withRecommendation(f, OLD))
                .toList();

        seed(List.of(topic));
        seed(previous);
        input.set(previous);
        assertEquals(0, sync.synchronize(ContentSyncScope.ALL_CONCEPTS, OLD_SHA, "",
                ContentSyncAuditDigest.calculate(previous), true).updated());

        long conceptId = jdbc.queryForObject("select id from concept where content_key = ?",
                Long.class, "network-http.core.http-state-intermediary.cookie");
        jdbc.update("insert into concept_view_history(concept_id, viewed_at) values (?, current_timestamp)", conceptId);
        var before = jdbc.queryForList("select id, content_key, content_markdown from concept order by id");
        var refs = jdbc.queryForList("select * from reference order by id");
        var links = jdbc.queryForList("select * from concept_reference order by concept_id, reference_id");
        var history = jdbc.queryForList("select * from concept_view_history order by id");
        var checkpoint = jdbc.queryForList("select * from content_sync_checkpoint");
        var runs = jdbc.queryForList("select * from content_sync_run");

        // 1. 기존 DB 공유 Reference 메타데이터 변경 시 정책 예외 + 원인 필드 진단 + 완전 롤백
        input.set(current);
        var reviewError = assertThrows(IllegalStateException.class, () -> sync.synchronize(
                ContentSyncScope.ALL_CONCEPTS, NEW_SHA, OLD_SHA,
                ContentSyncAuditDigest.calculate(current), false));
        assertTrue(reviewError.getMessage().startsWith("Shared reference metadata requires review: " + URL),
                reviewError.getMessage());
        assertTrue(reviewError.getMessage().contains("fields=recommendation"), reviewError.getMessage());
        assertUnchanged(before, refs, links, history, checkpoint, runs);

        // 2. 소스 내부에서 동일 URL 메타데이터가 서로 충돌하면 DB 쓰기 전 즉시 차단
        input.set(inconsistent);
        var conflictError = assertThrows(IllegalStateException.class, () -> sync.synchronize(
                ContentSyncScope.ALL_CONCEPTS, "d".repeat(40), OLD_SHA,
                ContentSyncAuditDigest.calculate(inconsistent), false));
        assertTrue(conflictError.getMessage().startsWith("Conflicting shared reference metadata in source: " + URL),
                conflictError.getMessage());
        assertTrue(conflictError.getMessage().contains("fields=recommendation"), conflictError.getMessage());
        assertUnchanged(before, refs, links, history, checkpoint, runs);

        // 3. 공유 Reference 메타데이터를 유지한 본문 변경은 정상 반영 후 재실행 시 UNCHANGED 수렴
        var reviewed = previous.stream().map(f -> f.path().endsWith("/cookie.md")
                ? file(f, text(f) + "\n공유 참조 메타데이터를 변경하지 않는 검증용 본문입니다.\n") : f).toList();
        input.set(reviewed);
        String reviewedSha = "c".repeat(40);
        String digest = ContentSyncAuditDigest.calculate(reviewed);
        assertEquals(1, sync.synchronize(ContentSyncScope.ALL_CONCEPTS, reviewedSha, OLD_SHA, digest, false).updated());
        assertEquals(0, sync.synchronize(ContentSyncScope.ALL_CONCEPTS, reviewedSha, reviewedSha, digest, false).updated());
        assertEquals(history, jdbc.queryForList("select * from concept_view_history order by id"));
        assertEquals(refs, jdbc.queryForList("select * from reference order by id"));
        assertEquals(links, jdbc.queryForList("select * from concept_reference order by concept_id, reference_id"));
    }

    private void assertUnchanged(
            List<?> before, List<?> refs, List<?> links, List<?> history, List<?> checkpoint, List<?> runs) {
        assertEquals(before, jdbc.queryForList("select id, content_key, content_markdown from concept order by id"));
        assertEquals(refs, jdbc.queryForList("select * from reference order by id"));
        assertEquals(links, jdbc.queryForList("select * from concept_reference order by concept_id, reference_id"));
        assertEquals(history, jdbc.queryForList("select * from concept_view_history order by id"));
        assertEquals(checkpoint, jdbc.queryForList("select * from content_sync_checkpoint"));
        assertEquals(runs, jdbc.queryForList("select * from content_sync_run"));
    }

    private static CanonicalContentFile withRecommendation(CanonicalContentFile template, String value) {
        String source = text(template).replace("\r\n", "\n");
        String oldLine = "    recommendation: \"" + OLD + "\"";
        String newLine = "    recommendation: \"" + NEW + "\"";
        String targetLine = "    recommendation: \"" + value + "\"";
        int urlStart = source.indexOf("  - url: \"" + URL + "\"");
        assertTrue(urlStart >= 0, template.path());
        int nextReference = source.indexOf("\n  - url:", urlStart + 1);
        int frontmatterEnd = source.indexOf("\n---", urlStart);
        assertTrue(frontmatterEnd > urlStart, template.path());
        int end = nextReference >= 0 ? Math.min(nextReference, frontmatterEnd) : frontmatterEnd;
        String reference = source.substring(urlStart, end);
        boolean hasOld = reference.contains(oldLine);
        boolean hasNew = reference.contains(newLine);
        assertTrue(hasOld ^ hasNew, "Unexpected shared recommendation: " + template.path());
        String originalLine = hasOld ? oldLine : newLine;
        return file(template, source.substring(0, urlStart)
                + reference.replace(originalLine, targetLine) + source.substring(end));
    }

    private void seed(List<CanonicalContentFile> files) {
        var command = new ImportFilesCommand(files.stream()
                .map(f -> new ImportSourceFile(f.path(), f.content())).toList());
        var result = preview.preview(command);
        assertTrue(result.canApply(), result.toString());
        apply.apply(command, result.previewDigest());
    }

    private static String text(CanonicalContentFile file) {
        return new String(file.content(), StandardCharsets.UTF_8);
    }

    private static CanonicalContentFile file(CanonicalContentFile original, String text) {
        return new CanonicalContentFile(original.path(), text.getBytes(StandardCharsets.UTF_8));
    }
}
