package com.guseoh.csforge.learning.application;

/** 페이징 결과의 application 메타데이터를 전달하는 view이다. */
public record PageMetadataView(
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext,
        boolean hasPrevious) {
}
