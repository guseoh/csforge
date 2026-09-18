package com.guseoh.csforge.security.config;

import com.guseoh.csforge.security.api.SecurityApiAccessDeniedHandler;
import com.guseoh.csforge.security.api.SecurityApiAuthenticationEntryPoint;
import com.guseoh.csforge.security.application.AllowedEmailAuthorizationManager;
import com.guseoh.csforge.security.application.AllowedEmailPolicy;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestHandler;

/** cloud 프로필에서만 OAuth2 로그인과 JDBC 세션 기반 API 보호를 활성화한다. */
@Configuration
@Profile("cloud")
@EnableWebSecurity
@EnableConfigurationProperties(CloudSecurityProperties.class)
public class CloudSecurityConfiguration {

    @Bean
    AllowedEmailPolicy allowedEmailPolicy(CloudSecurityProperties properties) {
        return new AllowedEmailPolicy(properties.allowedEmail());
    }

    @Bean
    AllowedEmailAuthorizationManager allowedEmailAuthorizationManager(AllowedEmailPolicy policy) {
        return new AllowedEmailAuthorizationManager(policy);
    }

    @Bean
    CsrfTokenRepository cloudCsrfTokenRepository() {
        CookieCsrfTokenRepository repository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        repository.setCookieCustomizer(cookie -> cookie
                .secure(true)
                .httpOnly(false)
                .sameSite("Lax")
                .path("/"));
        return repository;
    }

    @Bean
    CsrfTokenRequestHandler cloudCsrfTokenRequestHandler() {
        return new SpaCsrfTokenRequestHandler();
    }

    @Bean
    SecurityApiAuthenticationEntryPoint securityApiAuthenticationEntryPoint(
            tools.jackson.databind.ObjectMapper objectMapper) {
        return new SecurityApiAuthenticationEntryPoint(objectMapper);
    }

    @Bean
    SecurityApiAccessDeniedHandler securityApiAccessDeniedHandler(tools.jackson.databind.ObjectMapper objectMapper) {
        return new SecurityApiAccessDeniedHandler(objectMapper);
    }

    @Bean
    SecurityFilterChain cloudSecurityFilterChain(
            HttpSecurity http,
            AllowedEmailAuthorizationManager allowedEmailAuthorizationManager,
            CloudSecurityProperties properties,
            CsrfTokenRepository csrfTokenRepository,
            CsrfTokenRequestHandler csrfTokenRequestHandler,
            SecurityApiAuthenticationEntryPoint authenticationEntryPoint,
            SecurityApiAccessDeniedHandler accessDeniedHandler) throws Exception {
        http
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/actuator/health", "/actuator/health/**", "/oauth2/**", "/login/**",
                                "/error", "/api/auth/logout")
                        .permitAll()
                        .requestMatchers("/api/**")
                        .access(allowedEmailAuthorizationManager)
                        .anyRequest()
                        .denyAll())
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .oauth2Login(oauth2 -> oauth2.defaultSuccessUrl(properties.frontendOrigin(), true))
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("SESSION", "JSESSIONID")
                        .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler(HttpStatus.NO_CONTENT)))
                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfTokenRepository)
                        .csrfTokenRequestHandler(csrfTokenRequestHandler));
        return http.build();
    }
}
