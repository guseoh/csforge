package com.guseoh.csforge.search.application;

import java.util.List;

/** PostgreSQL에서 Search filter 선택지를 제공하는 persistence 경계이다. */
public interface SearchFilterOptionsProvider {
    List<SearchAreaFilterView> load();
}
