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
    void auditIsOwnerOnlyAndDoesNotExposeCanonicalPayloads() throws Exception {
        mockMvc.perform(get("/api/content-sync/audit")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/content-sync/audit").with(oidcLogin().idToken(token -> token.claim("email", "other@example.com"))))
                .andExpect(status().isForbidden());
        var before = privateCounts();
        mockMvc.perform(get("/api/content-sync/audit").with(allowedLogin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.manifestDigest").isNotEmpty())
                .andExpect(jsonPath("$.items[*].before").doesNotExist())
                .andExpect(jsonPath("$.items[*].after").doesNotExist());
        org.junit.jupiter.api.Assertions.assertEquals(before, privateCounts());
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
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(false));
    }

    @Test
    void publicSessionNeverExposesAnUnapprovedIdentity() throws Exception {
        mockMvc.perform(get("/api/auth/session"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(false))
                .andExpect(jsonPath("$.mode").value("CLOUD"))
                .andExpect(jsonPath("$.email").isEmpty());
        for (boolean verified : new boolean[] { true, false }) {
            mockMvc.perform(get("/api/auth/session").with(oidcLogin().idToken(token -> token
                            .claim("email", verified ? "other@example.com" : "owner@example.com")
                            .claim("email_verified", verified))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.authenticated").value(false))
                    .andExpect(jsonPath("$.email").isEmpty());
        }
        mockMvc.perform(get("/api/auth/session").with(allowedLogin()))
                .andExpect(jsonPath("$.authenticated").value(true));
    }

    @Test
    void onlyExplicitPublicReadsAreAnonymous() throws Exception {
        for (String path : java.util.List.of("/api/public/learning-areas", "/api/public/learning-areas/java",
                "/api/public/learning-areas/java/outline", "/api/public/concepts",
                "/api/public/search?q=java", "/api/public/search/suggestions?q=java",
                "/api/public/search/filter-options", "/api/public/search/status")) {
            mockMvc.perform(get(path)).andExpect(status().isOk());
            mockMvc.perform(get(path).with(oidcLogin())).andExpect(status().isOk());
            for (String method : java.util.List.of("POST", "PATCH", "PUT", "DELETE")) {
                mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                                .request(org.springframework.http.HttpMethod.valueOf(method), path).with(csrf()))
                        .andExpect(status().isUnauthorized());
            }
        }
        mockMvc.perform(get("/api/public/unknown")).andExpect(status().isUnauthorized());
        for (String query : java.util.List.of("size=101", "size=0", "page=-1", "sort=VIEWED", "page=101&size=100")) {
            mockMvc.perform(get("/api/public/concepts?" + query)).andExpect(status().isBadRequest());
        }
        for (String path : java.util.List.of("/api/dashboard", "/api/quizzes/active", "/api/quizzes/1/result",
                "/api/wrong-notes", "/api/reviews", "/api/concepts/1", "/api/concepts/1/understanding",
                "/api/bookmark-categories", "/api/imports", "/api/search?q=java")) {
            mockMvc.perform(get(path)).andExpect(status().isUnauthorized());
            mockMvc.perform(get(path).with(oidcLogin())).andExpect(status().isForbidden());
        }
        for (String path : java.util.List.of("/api/dashboard", "/api/quizzes/availability", "/api/quizzes/active",
                "/api/wrong-notes", "/api/reviews", "/api/bookmark-categories", "/api/canonical-bootstrap/status")) {
            mockMvc.perform(get(path).with(allowedLogin())).andExpect(status().is2xxSuccessful());
        }
        for (String path : java.util.List.of("/api/concepts/1/view", "/api/quizzes", "/api/reviews/quizzes",
                "/api/imports/preview", "/api/imports/apply", "/api/canonical-bootstrap")) {
            mockMvc.perform(post(path).with(csrf())).andExpect(status().isUnauthorized());
            mockMvc.perform(post(path).with(csrf()).with(oidcLogin())).andExpect(status().isForbidden());
        }
    }

    @Test
    void publicReaderExcludesPersonalFieldsAndDoesNotWriteHistory() throws Exception {
        long area = jdbc.queryForObject("select id from learning_area where slug = 'java'", Long.class);
        long topic = jdbc.queryForObject("""
                insert into topic (learning_area_id, content_key, slug, title, display_order, active)
                values (?, 'public-fixture', 'public-fixture', 'Public fixture', 1, true) returning id
                """, Long.class, area);
        long concept = jdbc.queryForObject("""
                insert into concept (topic_id, content_key, slug, title, summary, content_markdown, level, status, display_order)
                values (?, 'public-fixture.c', 'public-c', 'Public fixture concept', 'Public summary', 'Public body', 1, 'PUBLISHED', 1) returning id
                """, Long.class, topic);
        jdbc.update("insert into personal_note (concept_id, content) values (?, 'OWNER SECRET')", concept);
        long draft = jdbc.queryForObject("""
                insert into concept (topic_id, content_key, slug, title, content_markdown, level, status, display_order)
                values (?, 'public-fixture.draft', 'draft', 'SECRET_DRAFT', 'SECRET_DRAFT', 1, 'DRAFT', 2) returning id
                """, Long.class, topic);
        long reference = jdbc.queryForObject("""
                insert into reference (url, title, reference_type) values ('https://example.com/public-fixture', 'Public reference fixture', 'OFFICIAL') returning id
                """, Long.class);
        jdbc.update("insert into concept_reference (concept_id, reference_id, relation_note) values (?, ?, 'Public relation')", concept, reference);
        jdbc.update("insert into concept_reference (concept_id, reference_id, relation_note) values (?, ?, 'SECRET_DRAFT')", draft, reference);
        var before = privateCounts();
        mockMvc.perform(get("/api/public/concepts/" + concept))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Public fixture concept"))
                .andExpect(jsonPath("$.progress").doesNotExist())
                .andExpect(jsonPath("$.personalNote").doesNotExist());
        mockMvc.perform(get("/api/public/concepts/" + draft)).andExpect(status().isNotFound());
        mockMvc.perform(get("/api/public/search?q=SECRET_DRAFT"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalHits").value(0));
        mockMvc.perform(get("/api/public/concepts"))
                .andExpect(jsonPath("$.items[*].learningStatus").isEmpty());
        mockMvc.perform(get("/api/public/concepts?q=fixture&size=1&sort=TITLE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page.totalElements").value(1))
                .andExpect(jsonPath("$.items[0].id").value(concept));
        mockMvc.perform(get("/api/public/search?q=OWNER%20SECRET"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalHits").value(0));
        mockMvc.perform(get("/api/public/search/suggestions?q=개인"))
                .andExpect(status().isOk()).andExpect(jsonPath("$[*].documentType").isEmpty());
        mockMvc.perform(get("/api/public/search?q=fixture&type=PERSONAL_NOTE"))
                .andExpect(status().isBadRequest());
        org.junit.jupiter.api.Assertions.assertEquals(before, privateCounts());
        mockMvc.perform(get("/api/concepts/" + concept).with(allowedLogin()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.personalNote.content").value("OWNER SECRET"));
        mockMvc.perform(post("/api/concepts/" + concept + "/view").with(allowedLogin()).with(csrf()))
                .andExpect(status().isOk());
        org.junit.jupiter.api.Assertions.assertEquals(before.get("concept_view_history") + 1,
                privateCounts().get("concept_view_history"));
        jdbc.update("update topic set active = false where id = ?", topic);
        mockMvc.perform(get("/api/public/concepts/" + concept)).andExpect(status().isNotFound());
        mockMvc.perform(get("/api/public/search?q=fixture"))
                .andExpect(jsonPath("$.totalHits").value(0));
    }

    private java.util.Map<String, Long> privateCounts() {
        var counts = new java.util.LinkedHashMap<String, Long>();
        for (String table : java.util.List.of("personal_note", "concept_progress", "concept_view_history",
                "attempt", "wrong_note", "review_schedule", "quiz_session")) {
            counts.put(table, jdbc.queryForObject("select count(*) from " + table, Long.class));
        }
        return counts;
    }

    private OidcLoginRequestPostProcessor allowedLogin() {
        return oidcLogin().idToken(token -> token
                .claim("email", "owner@example.com")
                .claim("email_verified", true));
    }
}
