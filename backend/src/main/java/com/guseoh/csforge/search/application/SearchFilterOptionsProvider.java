package com.guseoh.csforge.search.application;

import java.util.List;

/** Elasticsearch 장애와 무관하게 PostgreSQL에서 Search filter 선택지를 제공하는 경계이다. */
public interface SearchFilterOptionsProvider {
    List<SearchAreaFilterView> load();
}
