package com.guseoh.csforge.search.application;

import java.util.Set;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Search source 이벤트를 최신 PostgreSQL 상태 기준의 Elasticsearch 문서들로 수렴시킨다. */
@Service
@RequiredArgsConstructor
public class DefaultSearchProjectionIndexer implements SearchProjectionIndexer {

    private final SearchProjectionTargetResolver targetResolver;
    private final SearchProjectionLoader projectionLoader;
    private final SearchProjectionStore projectionStore;

    @Override
    @Transactional(readOnly = true)
    public void apply(SearchIndexEvent event) {
        Set<SearchDocumentRef> targets = targetResolver.resolve(event.changeType(), event.sourceId());
        for (SearchDocumentRef target : targets) {
            projectionLoader.load(target).ifPresentOrElse(
                    projectionStore::upsert,
                    () -> projectionStore.delete(target));
        }
    }
}
