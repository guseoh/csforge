package com.guseoh.csforge.security.application;

import java.util.Locale;

import org.springframework.util.StringUtils;

/** Google OIDC의 검증된 이메일과 단일 허용 계정을 비교하는 정책이다. */
public final class AllowedEmailPolicy {

    private final String allowedEmail;

    public AllowedEmailPolicy(String allowedEmail) {
        if (!StringUtils.hasText(allowedEmail)) {
            throw new IllegalArgumentException("An allowed email is required");
        }
        this.allowedEmail = normalize(allowedEmail);
    }

    public boolean isAllowed(String email, Object emailVerifiedClaim) {
        return StringUtils.hasText(email)
                && allowedEmail.equals(normalize(email))
                && isVerified(emailVerifiedClaim);
    }

    private boolean isVerified(Object emailVerifiedClaim) {
        if (emailVerifiedClaim instanceof Boolean verified) {
            return verified;
        }
        return emailVerifiedClaim != null && Boolean.parseBoolean(emailVerifiedClaim.toString());
    }

    private String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
