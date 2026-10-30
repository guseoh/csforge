package com.guseoh.csforgesync;

import com.guseoh.csforge.importcontent.application.*;
import com.guseoh.csforge.importcontent.sync.*;
import java.net.URI;
import java.time.Clock;
import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.*;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.web.bind.annotation.RestController;

/** HTTP 서버와 사용자 인증 우회 없이 기존 Import 서비스를 실행하는 Job 진입점이다. */
@SpringBootConfiguration
@EnableAutoConfiguration
@EntityScan("com.guseoh.csforge")
@EnableJpaRepositories("com.guseoh.csforge")
@ComponentScan(basePackages = "com.guseoh.csforge.importcontent", excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = RestController.class),
        @ComponentScan.Filter(type = FilterType.CUSTOM, classes = org.springframework.boot.context.TypeExcludeFilter.class),
        @ComponentScan.Filter(type = FilterType.CUSTOM, classes = org.springframework.boot.autoconfigure.AutoConfigurationExcludeFilter.class)
})
public class ContentSyncJob {
    @Bean Clock syncClock() { return Clock.systemUTC(); }

    public static void main(String[] args) {
        if (args.length != 0) throw new IllegalArgumentException("Job accepts environment configuration only");
        System.setProperty("spring.flyway.enabled", "false");
        System.setProperty("spring.main.web-application-type", "none");
        var app = new SpringApplication(ContentSyncJob.class);
        app.setWebApplicationType(WebApplicationType.NONE);
        // This entry point must not perform implicit migrations on a production database.
        app.setDefaultProperties(Map.of("spring.flyway.enabled", "false", "spring.main.banner-mode", "off"));
        try (var context = app.run()) {
            var env = context.getEnvironment();
            String sha = env.getRequiredProperty("SYNC_SOURCE_SHA");
            String imageSha;
            try (var input = ContentSyncJob.class.getResourceAsStream("/canonical-source.sha")) {
                if (input == null) throw new IllegalStateException("Image source SHA is missing");
                imageSha = new String(input.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8).trim();
            } catch (java.io.IOException e) { throw new IllegalStateException("Cannot read source SHA", e); }
            if (!sha.matches("[0-9a-f]{40}") || !sha.equals(imageSha)) throw new IllegalStateException("Image/source SHA mismatch");
            String url = env.getRequiredProperty("spring.datasource.url");
            var uri = URI.create(url.replaceFirst("^jdbc:", ""));
            if (!env.getRequiredProperty("SYNC_EXPECTED_DB_HOST").equals(uri.getHost())
                    || !env.getRequiredProperty("SYNC_EXPECTED_DB_NAME").equals(uri.getPath().substring(1)))
                throw new IllegalStateException("Database target mismatch");
            String mode = env.getProperty("SYNC_MODE", "AUDIT");
            var scope = ContentSyncScope.valueOf(env.getProperty("SYNC_SCOPE", "JAVA_CONCEPTS"));
            var scopedFiles = context.getBean(CanonicalContentSource.class).load().stream().filter(f -> scope.includes(f.path())).toList();
            String scopedDigest = ContentSyncAuditDigest.calculate(scopedFiles);
            if (mode.equals("AUDIT")) {
                var report = context.getBean(ContentSyncAuditService.class).audit();
                System.out.println("CONTENT_SYNC_AUDIT files=" + report.sourceFiles() + " updated=" + report.updated()
                        + " created=" + report.created() + " errors=" + report.errors() + " manifest=" + report.manifestDigest());
                System.out.println("CONTENT_SYNC_SCOPE scope=" + scope + " manifest=" + scopedDigest);
                System.out.println(context.getBean(tools.jackson.databind.ObjectMapper.class).writeValueAsString(
                        com.guseoh.csforge.importcontent.api.ContentSyncAuditResponse.from(report)));
                if (report.errors() > 0) throw new IllegalStateException("Audit validation errors");
                return;
            }
            if (mode.equals("QUESTION_PLAN")) {
                if (scope != ContentSyncScope.JAVA_QUESTIONS) throw new IllegalArgumentException("Question scope required");
                var plan = context.getBean(QuestionReconciliationService.class).planCandidates();
                System.out.println("CONTENT_QUESTION_PLAN sourceSha=" + sha + " " + plan);
                return;
            }
            if (!Boolean.parseBoolean(env.getProperty("SYNC_APPLY_ENABLED", "false")))
                throw new IllegalStateException("Automatic apply is disabled");
            if (!mode.equals("INITIALIZE") && !mode.equals("APPLY") && !mode.equals("QUESTION_APPLY"))
                throw new IllegalArgumentException("Unknown sync mode");
            String frontendSha = env.getRequiredProperty("SYNC_FRONTEND_SHA");
            String backendSha = env.getRequiredProperty("SYNC_BACKEND_SHA");
            if (!sha.equals(frontendSha) || !sha.equals(backendSha)) throw new IllegalStateException("Deployment SHA mismatch");
            // Operator/CI supplies evidence only after verifying the actual provider state.
            java.time.Instant recovery = java.time.Instant.parse(env.getRequiredProperty("SYNC_RECOVERY_VERIFIED_AT"));
            long age = java.time.Duration.between(recovery, java.time.Instant.now()).getSeconds();
            if (age < 0 || age > 900) throw new IllegalStateException("Fresh recovery evidence required");
            if (mode.equals("QUESTION_APPLY")) {
                if (scope != ContentSyncScope.JAVA_QUESTIONS
                        || !Boolean.parseBoolean(env.getProperty("SYNC_QUESTION_RECONCILE_ENABLED", "false")))
                    throw new IllegalStateException("Question reconciliation disabled");
                var plan = new QuestionCandidatePlan(env.getRequiredProperty("SYNC_QUESTION_SOURCE_DIGEST"),
                        env.getRequiredProperty("SYNC_QUESTION_PREVIEW_DIGEST"),
                        env.getRequiredProperty("SYNC_QUESTION_SELECTION_DIGEST"),
                        Integer.parseInt(env.getRequiredProperty("SYNC_QUESTION_SELECTED")));
                var result = context.getBean(QuestionReconciliationService.class).applyCandidates(plan, sha);
                System.out.println("CONTENT_QUESTION_RECONCILED sourceSha=" + sha + " selectionDigest="
                        + plan.selectionDigest() + " updated=" + result.updated()
                        + " unchanged=" + result.unchanged() + " created=" + result.created());
                return;
            }
            if ((scope == ContentSyncScope.JAVA_QUESTIONS || scope == ContentSyncScope.ALL_QUESTIONS)
                    && !Boolean.parseBoolean(env.getProperty("SYNC_QUESTIONS_ENABLED", "false")))
                throw new IllegalStateException("Question synchronization disabled");
            String baseline = env.getProperty("SYNC_EXPECTED_BASELINE_SHA");
            if (baseline == null) baseline = context.getBean(com.guseoh.csforge.importcontent.domain.ContentSyncCheckpointRepository.class)
                    .findById(scope.name()).map(com.guseoh.csforge.importcontent.domain.ContentSyncCheckpoint::getSourceSha).orElse("");
            var result = context.getBean(ContentSyncService.class).synchronize(scope, sha,
                    baseline, env.getProperty("SYNC_MANIFEST_DIGEST", scopedDigest), mode.equals("INITIALIZE"));
            System.out.println("CONTENT_SYNC_SUCCESS " + result);
        }
    }
}
