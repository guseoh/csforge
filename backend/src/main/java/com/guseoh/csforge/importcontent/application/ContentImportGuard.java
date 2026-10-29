package com.guseoh.csforge.importcontent.application;

import com.guseoh.csforge.importcontent.domain.ContentImportLockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/** canonical 반영과 Attempt 생성의 경합을 같은 transaction 잠금으로 직렬화한다. */
@Component
@RequiredArgsConstructor
public class ContentImportGuard {
    private final ContentImportLockRepository locks;

    @Transactional(propagation = Propagation.MANDATORY)
    public void acquire() {
        if (locks.acquire() == null) throw new IllegalStateException("Canonical lock row is missing");
    }
}
