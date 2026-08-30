package com.guseoh.csforge.review.api;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/**
 * REVIEW source 퀴즈 생성 요청이다.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ReviewQuizRequest(@Min(1) @Max(50) Integer count) {
}
