package com.guseoh.csforge.global.api;

import java.time.Instant;
import java.util.List;

/**
 * API 오류 응답의 공통 형식을 표현하는 응답 모델이다.
 */
public record ApiError(
        Instant timestamp,
        int status,
        String code,
        String message,
        String path,
        List<FieldViolationResponse> fieldErrors) {
}
