package com.guseoh.csforge.importcontent.sync;

/** 개인 학습 내역이나 문항 목록 없이 안전 후보 집합과 원본 상태를 식별한다. */
public record QuestionCandidatePlan(String sourceDigest, String previewDigest,
        String selectionDigest, int selected) { }
