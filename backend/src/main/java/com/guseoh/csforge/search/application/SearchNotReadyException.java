package com.guseoh.csforge.search.application;

/** Search alias가 아직 생성되지 않아 최초 reindex가 필요한 상태이다. */
public class SearchNotReadyException extends RuntimeException {
    public SearchNotReadyException() {
        super("Search index is not ready; run a full reindex first");
    }
}
