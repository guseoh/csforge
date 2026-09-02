package com.guseoh.csforge.search.application;

import java.util.Set;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** outbox catch-up 변경을 최신 PostgreSQL desired state 기준으로 새 physical index에 직접 반영한다. */
@Service
@RequiredArgsConstructor
public class SearchReindexProjectionUpdater {

    private final SearchProjectionTargetResolver targetResolver;
    private final SearchProjectionLoader projectionLoader;
    private final SearchReindexIndexStore indexStore;

    @Transactional(readOnly = true)
    public void apply(String physicalIndex, SearchChangeType changeType, long sourceId) {
        Set<SearchDocumentRef> targets = targetResolver.resolve(changeType, sourceId);
        for (SearchDocumentRef target : targets) {
            projectionLoader.load(target).ifPresentOrElse(
                    document -> indexStore.upsert(physicalIndex, document),
                    () -> indexStore.delete(physicalIndex, target));
        }
    }
}
