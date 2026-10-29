package com.guseoh.csforge.importcontent.sync;

import static org.junit.jupiter.api.Assertions.*;

import com.guseoh.csforge.importcontent.application.ContentSyncAuditService;
import com.guseoh.csforge.test.PostgresIntegrationTestSupport;
import com.guseoh.csforgesync.ContentSyncJob;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** 별도 HTTP 서버 없이 Job 컨텍스트가 기존 JPA Import 서비스를 구성하는지 검증한다. */
@SpringBootTest(classes = ContentSyncJob.class, webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Testcontainers
class ContentSyncJobIntegrationTest {
    @Container
    static final PostgreSQLContainer<?> DB = PostgresIntegrationTestSupport.container("sync_job_test");

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        PostgresIntegrationTestSupport.registerDataSourceProperties(registry, DB);
    }

    @Autowired ApplicationContext context;
    @Autowired ContentSyncAuditService audit;
    @Autowired ContentSyncService sync;
    @Autowired com.guseoh.csforge.importcontent.domain.ContentSyncCheckpointRepository checkpoints;

    @Test
    void jobStartsWithoutHttpControllersAndCanAudit() {
        assertTrue(context.getBeansWithAnnotation(org.springframework.web.bind.annotation.RestController.class).isEmpty());
        var report = audit.audit();
        assertTrue(report.sourceFiles() > 0);
        assertEquals(0, checkpoints.count());
        assertNotNull(sync);
    }
}
