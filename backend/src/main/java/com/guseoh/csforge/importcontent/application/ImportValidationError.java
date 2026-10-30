package com.guseoh.csforge.importcontent.application;

/** 가져오기 항목의 경로별 검증 오류이다. */
public record ImportValidationError(String path, String message) { }
