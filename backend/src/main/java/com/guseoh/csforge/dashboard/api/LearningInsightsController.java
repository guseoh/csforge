package com.guseoh.csforge.dashboard.api;

import com.guseoh.csforge.dashboard.application.LearningInsightsQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 학습 진단의 읽기 전용 7/30일 조회 엔드포인트이다. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/learning-insights")
public class LearningInsightsController {

    private final LearningInsightsQueryService service;

    @GetMapping
    public LearningInsightsResponse getInsights(
            @RequestParam(defaultValue = "7d") String range,
            @RequestParam(required = false) String area) {
        return LearningInsightsResponse.from(service.getInsights(range, area));
    }
}
