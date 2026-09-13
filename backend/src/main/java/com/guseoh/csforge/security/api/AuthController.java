package com.guseoh.csforge.security.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** SPA가 local trusted access와 cloud 인증 세션을 구분하도록 현재 세션을 제공한다. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final String mode;

    public AuthController(@Value("${csforge.security.mode:local}") String mode) {
        this.mode = mode;
    }

    @GetMapping("/session")
    public AuthSessionResponse session(Authentication authentication) {
        if ("local".equalsIgnoreCase(mode)) {
            return new AuthSessionResponse(true, "LOCAL", null);
        }
        return new AuthSessionResponse(
                authentication != null && authentication.isAuthenticated(),
                "CLOUD",
                emailOf(authentication));
    }

    private String emailOf(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof OAuth2User user)) {
            return null;
        }
        return user.getAttribute("email");
    }
}
