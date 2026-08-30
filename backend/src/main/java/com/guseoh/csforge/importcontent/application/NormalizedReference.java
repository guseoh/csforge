package com.guseoh.csforge.importcontent.application;

/** 파서가 정규화한 Concept reference 입력이다. */
public record NormalizedReference(String url, String title, String referenceType, String language,
        String depth, String recommendation, int displayOrder, String relationNote) { }
