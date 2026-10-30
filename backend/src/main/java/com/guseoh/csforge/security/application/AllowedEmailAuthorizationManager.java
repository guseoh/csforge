package com.guseoh.csforge.security.application;

import java.util.function.Supplier;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;

/** cloud API 요청의 인증 주체가 허용된 Google 계정인지 판단한다. */
public final class AllowedEmailAuthorizationManager implements AuthorizationManager<RequestAuthorizationContext> {

    private final AllowedEmailPolicy policy;

    public AllowedEmailAuthorizationManager(AllowedEmailPolicy policy) {
        this.policy = policy;
    }

    @Override
    public AuthorizationDecision authorize(
            Supplier<? extends Authentication> authentication,
            RequestAuthorizationContext context) {
        Authentication current = authentication.get();
        if (current == null || !current.isAuthenticated() || current instanceof AnonymousAuthenticationToken) {
            return new AuthorizationDecision(false);
        }
        if (!(current.getPrincipal() instanceof OAuth2User user)) {
            return new AuthorizationDecision(false);
        }
        return new AuthorizationDecision(policy.isAllowed(
                user.getAttribute("email"),
                user.getAttribute("email_verified")));
    }
}
