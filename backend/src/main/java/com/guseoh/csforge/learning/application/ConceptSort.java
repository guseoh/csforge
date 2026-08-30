package com.guseoh.csforge.learning.application;

import java.util.Locale;

public enum ConceptSort {
    CURRICULUM,
    TITLE,
    UPDATED,
    VIEWED;

    public static ConceptSort from(String value) {
        if (value == null || value.isBlank()) {
            return CURRICULUM;
        }
        try {
            return valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new LearningBadRequestException("Unsupported sort: " + value);
        }
    }
}
