package com.guseoh.csforge.test;

import org.springframework.test.context.DynamicPropertyRegistry;
import org.testcontainers.containers.PostgreSQLContainer;

/** PostgreSQL 통합 테스트가 공통으로 사용하는 컨테이너와 datasource 등록을 제공한다. */
public final class PostgresIntegrationTestSupport {

    private PostgresIntegrationTestSupport() {
    }

    public static PostgreSQLContainer<?> container(String databaseName) {
        return new PostgreSQLContainer<>("postgres:16.4")
                .withDatabaseName(databaseName)
                .withUsername("csforge")
                .withPassword("csforge");
    }

    public static void registerDataSourceProperties(
            DynamicPropertyRegistry registry,
            PostgreSQLContainer<?> container) {
        registry.add("spring.datasource.url", container::getJdbcUrl);
        registry.add("spring.datasource.username", container::getUsername);
        registry.add("spring.datasource.password", container::getPassword);
    }
}
