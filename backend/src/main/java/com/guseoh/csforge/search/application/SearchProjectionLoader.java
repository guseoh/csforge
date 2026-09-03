package com.guseoh.csforge.search.application;

import java.util.Optional;

/** 검색 문서 한 건의 최신 desired state를 PostgreSQL에서 조립하는 경계이다. */
public interface SearchProjectionLoader {
    Optional<SearchProjectionDocument> load(SearchDocumentRef ref);
}
