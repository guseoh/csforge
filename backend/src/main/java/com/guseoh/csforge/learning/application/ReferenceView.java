package com.guseoh.csforge.learning.application;

import com.guseoh.csforge.learning.domain.ReferenceType;

/** Concept에 연결된 참고 자료를 전달하는 application view이다. */
public record ReferenceView(
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
