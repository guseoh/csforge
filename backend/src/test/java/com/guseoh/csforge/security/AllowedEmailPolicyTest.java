package com.guseoh.csforge.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.guseoh.csforge.security.application.AllowedEmailPolicy;
import org.junit.jupiter.api.Test;

/** 허용 이메일 정책의 일치와 검증된 claim 조건을 검증한다. */
class AllowedEmailPolicyTest {

    private final AllowedEmailPolicy policy = new AllowedEmailPolicy("owner@example.com");

    @Test
    void allowsOnlyTheConfiguredVerifiedEmail() {
        assertTrue(policy.isAllowed(" OWNER@example.com ", true));
        assertFalse(policy.isAllowed("owner@example.com", false));
        assertFalse(policy.isAllowed("other@example.com", true));
    }

    @Test
    void rejectsMissingAllowlist() {
        assertThrows(IllegalArgumentException.class, () -> new AllowedEmailPolicy(" "));
    }
}
