package com.guseoh.csforge.importcontent.sync;

import static org.junit.jupiter.api.Assertions.*;

import com.guseoh.csforge.test.PostgresIntegrationTestSupport;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** 동기화 역할에 필요한 권한과 개인 기록 보호를 격리 DB에서 검증한다. */
@SpringBootTest
@Testcontainers
class ContentSyncRoleIntegrationTest {
    @Container static final PostgreSQLContainer<?> DB = PostgresIntegrationTestSupport.container("sync_role");
    @DynamicPropertySource static void database(DynamicPropertyRegistry registry) {
        PostgresIntegrationTestSupport.registerDataSourceProperties(registry, DB);
    }
    @Autowired JdbcTemplate jdbc;

    @Test void scopedRoleCannotReadOrWritePersonalData() throws Exception {
        String sql = Files.readString(Path.of("..", "infra", "content-sync", "sync-role-grants.sql"));
        sql = sql.replace("DATABASE neondb", "DATABASE " + DB.getDatabaseName());
        jdbc.execute("CREATE ROLE csforge_content_sync NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT");
        jdbc.execute(sql);
        assertEquals(Boolean.TRUE, jdbc.queryForObject("SELECT has_column_privilege('csforge_content_sync','public.attempt','question_id','SELECT')", Boolean.class));
        assertEquals(Boolean.FALSE, jdbc.queryForObject("SELECT has_table_privilege('csforge_content_sync','public.attempt','UPDATE')", Boolean.class));
        assertEquals(Boolean.FALSE, jdbc.queryForObject("SELECT has_table_privilege('csforge_content_sync','public.concept_progress','SELECT')", Boolean.class));
        assertEquals(Boolean.FALSE, jdbc.queryForObject("SELECT has_table_privilege('csforge_content_sync','public.question_answer','DELETE')", Boolean.class));
        assertEquals(Boolean.TRUE, jdbc.queryForObject("SELECT has_table_privilege('csforge_content_sync','public.concept','UPDATE')", Boolean.class));
        assertEquals(Boolean.TRUE, jdbc.queryForObject("SELECT has_sequence_privilege('csforge_content_sync','public.concept_id_seq','USAGE')", Boolean.class));
    }
}
