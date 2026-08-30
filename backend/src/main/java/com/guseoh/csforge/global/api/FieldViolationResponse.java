package com.guseoh.csforge.global.api;

/**
 * 요청 필드의 검증 실패 정보를 표현하는 응답 모델이다.
 */
public record FieldViolationResponse(String field, String message) {
}
