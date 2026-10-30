package com.guseoh.csforge.learning.api;

import com.guseoh.csforge.learning.domain.LearningStatus;

public record ConceptProgressUpdateRequest(LearningStatus status, Boolean bookmarked) {
}
