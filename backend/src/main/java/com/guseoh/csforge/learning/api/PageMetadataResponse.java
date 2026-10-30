package com.guseoh.csforge.learning.api;

public record PageMetadataResponse(
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext,
        boolean hasPrevious) {
}
