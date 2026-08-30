package com.guseoh.csforge.importcontent.api;

/** import 입력 오류의 API 표현이다. */
public record ImportValidationErrorResponse(String path, String message) { }
