package com.guseoh.csforge.importcontent.api;

import com.guseoh.csforge.importcontent.application.CanonicalBootstrapService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** canonical pack의 상태 조회와 명시적 bootstrap 실행 HTTP 계약을 제공한다. */
@RestController
@RequestMapping("/api/canonical-bootstrap")
@RequiredArgsConstructor
public class CanonicalBootstrapController {
    private final CanonicalBootstrapService service;
    private final CanonicalBootstrapApiMapper mapper;

    @GetMapping("/status")
    public CanonicalBootstrapStatusResponse status() {
        return mapper.toStatus(service.status());
    }

    @PostMapping
    public CanonicalBootstrapResponse bootstrap() {
        return mapper.toExecution(service.bootstrap());
    }
}
