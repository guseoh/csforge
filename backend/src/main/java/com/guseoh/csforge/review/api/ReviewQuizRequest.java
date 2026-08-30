package com.guseoh.csforge.review.api;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/**
 * REVIEW source 퀴즈 생성 요청이다.
 */
public record ReviewQuizRequest(@Min(1) @Max(50) Integer count, String mode) {
}
