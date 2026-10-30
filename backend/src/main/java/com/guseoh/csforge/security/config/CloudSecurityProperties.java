package com.guseoh.csforge.security.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/** cloud 프로필에서 접근을 허용할 Google 계정을 보관하는 설정이다. */
@Validated
@ConfigurationProperties(prefix = "csforge.security")
public record CloudSecurityProperties(@NotBlank String allowedEmail, @NotBlank String frontendOrigin) {
}
