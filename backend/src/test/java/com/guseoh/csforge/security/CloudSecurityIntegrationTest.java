package com.guseoh.csforge.security;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.guseoh.csforge.test.PostgresIntegrationTestSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.ApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.session.SessionRepository;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.OidcLoginRequestPostProcessor;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** cloud 보안 체인의 인증, allowlist, CSRF, 세션 무효화를 검증한다. */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("cloud")
class CloudSecurityIntegrationTest {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = PostgresIntegrationTestSupport.container("csforge_cloud_security_test");

    @Autowired
    MockMvc mockMvc;

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    ApplicationContext applicationContext;

    @DynamicPropertySource
    static void cloudProperties(DynamicPropertyRegistry registry) {
        PostgresIntegrationTestSupport.registerDataSourceProperties(registry, POSTGRES);
        registry.add("spring.security.oauth2.client.registration.google.client-id", () -> "test-client");
        registry.add("spring.security.oauth2.client.registration.google.client-secret", () -> "test-secret");
        registry.add("csforge.security.allowed-email", () -> "owner@example.com");
    }

    @Test
    void rejectsUnauthenticatedApiRequestsWith401() throws Exception {
        mockMvc.perform(get("/api/learning-areas"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
    }

    @Test
    void allowsTheVerifiedConfiguredOidcIdentity() throws Exception {
        mockMvc.perform(get("/api/learning-areas").with(allowedLogin()))
                .andExpect(status().isOk());
    }

    @Test
    void rejectsAnAuthenticatedIdentityOutsideTheAllowlist() throws Exception {
        mockMvc.perform(get("/api/learning-areas").with(oidcLogin().idToken(token -> token
                        .claim("email", "other@example.com")
                        .claim("email_verified", true))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
    }

    @Test
    void requiresCsrfForStateChangingApiRequests() throws Exception {
        mockMvc.perform(post("/api/concepts/1/view").with(allowedLogin()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));

        mockMvc.perform(post("/api/concepts/1/view").with(allowedLogin()).with(csrf()))
                .andExpect(result -> assertNotEquals(403, result.getResponse().getStatus()));
    }

    @Test
    void migrationCreatesTheSpringSessionTables() {
        Integer sessionTables = jdbc.queryForObject("""
                select count(*)
                from information_schema.tables
                where table_schema = 'public'
                  and table_name in ('spring_session', 'spring_session_attributes')
                """, Integer.class);

        assertTrue(sessionTables != null && sessionTables == 2);
    }

    @Test
    void cloudContextUsesJdbcSessionRepositoryAndFilter() {
        assertTrue(!applicationContext.getBeansOfType(SessionRepository.class).isEmpty());
        assertTrue(applicationContext.containsBean("springSessionRepositoryFilter"));
    }

    @Test
    void cloudSessionCookieUsesSecureHttpOnlyAndLaxSameSiteAttributes() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/auth/session").with(allowedLogin()))
                .andExpect(status().isOk())
                .andReturn();

        assertTrue(result.getResponse().getHeaders("Set-Cookie").stream()
                .anyMatch(cookie -> cookie.contains("SESSION=")
                        && cookie.contains("Secure")
                        && cookie.contains("HttpOnly")
                        && cookie.contains("SameSite=Lax")),
                () -> "Set-Cookie headers: " + result.getResponse().getHeaders("Set-Cookie"));
    }

    @Test
    void logoutInvalidatesTheAuthenticatedSession() throws Exception {
        MvcResult authenticated = mockMvc.perform(get("/api/auth/session").with(allowedLogin()))
                .andExpect(status().isOk())
                .andReturn();
        MockHttpSession session = (MockHttpSession) authenticated.getRequest().getSession(false);

        mockMvc.perform(post("/api/auth/logout").session(session).with(csrf()))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/auth/session").session(session))
                .andExpect(status().isUnauthorized());
    }

    private OidcLoginRequestPostProcessor allowedLogin() {
        return oidcLogin().idToken(token -> token
                .claim("email", "owner@example.com")
                .claim("email_verified", true));
    }
}
