package com.guseoh.csforge.learning.application;

import java.util.List;

public record ConceptSearchResult(List<ConceptSearchItem> items, long totalElements) {
}
