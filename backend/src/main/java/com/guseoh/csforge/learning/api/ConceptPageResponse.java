package com.guseoh.csforge.learning.api;

import java.util.List;

public record ConceptPageResponse(
        List<ConceptListItemResponse> items,
        PageMetadataResponse page) {
}
