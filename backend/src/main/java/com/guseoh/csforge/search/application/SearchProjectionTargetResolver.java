package com.guseoh.csforge.search.application;

import java.util.Set;

/** 한 source 변경이 무효화하는 검색 문서 집합을 계산하는 경계이다. */
public interface SearchProjectionTargetResolver {
    Set<SearchDocumentRef> resolve(SearchChangeType changeType, long sourceId);
}
