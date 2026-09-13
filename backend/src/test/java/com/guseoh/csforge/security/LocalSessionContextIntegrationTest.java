package com.guseoh.csforge.security;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.guseoh.csforge.test.PostgresIntegrationTestSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.ApplicationContext;
import org.springframework.session.SessionRepository;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** 기본 프로필에서 JDBC Spring Session이 활성화되지 않는지 검증한다. */
@Testcontainers
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LocalSessionContextIntegrationTest {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = PostgresIntegrationTestSupport.container("csforge_local_session_test");

    @Autowired
    ApplicationContext applicationContext;

    @Autowired
    MockMvc mockMvc;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        PostgresIntegrationTestSupport.registerDataSourceProperties(registry, POSTGRES);
    }

    @Test
    void localContextHasNoSpringSessionRepositoryOrFilter() {
        assertTrue(applicationContext.getBeansOfType(SessionRepository.class).isEmpty());
        assertTrue(!applicationContext.containsBean("springSessionRepositoryFilter"));
    }

    @Test
    void localApiRemainsAvailableWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/learning-areas"))
                .andExpect(status().isOk());
    }
}
