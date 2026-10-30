package com.guseoh.csforge.importcontent.api;

import com.guseoh.csforge.importcontent.application.ContentSyncAuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 기존 owner 인증 경계 안에서 읽기 전용 전체 콘텐츠 진단을 제공한다. */
@RestController
@RequestMapping("/api/content-sync")
@RequiredArgsConstructor
public class ContentSyncAuditController {
    private final ContentSyncAuditService service;

    @GetMapping("/audit")
    public ContentSyncAuditResponse audit() {
        return ContentSyncAuditResponse.from(service.audit());
    }
}
