package com.guseoh.csforge.learning.api;

import com.guseoh.csforge.learning.domain.ReferenceType;

public record ReferenceResponse(
        long id,
        String url,
        String title,
        ReferenceType type,
        String language,
        String depth,
        String recommendation,
        int displayOrder,
        String relationNote) {
}
