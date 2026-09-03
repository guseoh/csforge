package com.guseoh.csforge.search.application;

/** 검색 projection 문서를 결정적으로 식별하는 source 참조이다. */
public record SearchDocumentRef(SearchDocumentType documentType, long sourceId) {

    public SearchDocumentRef {
        if (documentType == null || sourceId <= 0) throw new IllegalArgumentException("Invalid search document reference");
    }

    public String documentKey() {
        return documentType.name() + ":" + sourceId;
    }
}
