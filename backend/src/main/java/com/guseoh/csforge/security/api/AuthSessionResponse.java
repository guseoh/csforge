package com.guseoh.csforge.security.api;

/** 현재 인증 모드와 세션의 최소 표시 정보를 담는 응답이다. */
public record AuthSessionResponse(boolean authenticated, String mode, String email) {
}
