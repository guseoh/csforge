package com.guseoh.csforge.dashboard.api;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.guseoh.csforge.dashboard.application.DashboardQueryService;

/** Dashboard read model을 HTTP API로 노출한다. */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardQueryService queryService;
    private final DashboardApiMapper apiMapper;

    @GetMapping
    public DashboardResponse getDashboard() {
        return apiMapper.toResponse(queryService.getDashboard());
    }
}
