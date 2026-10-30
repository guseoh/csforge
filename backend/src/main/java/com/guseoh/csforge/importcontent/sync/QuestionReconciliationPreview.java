package com.guseoh.csforge.importcontent.sync;

/** 원문과 개인 기록을 노출하지 않는 문항별 사전 검증 결과이다. */
public record QuestionReconciliationPreview(String sourceDigest, String previewDigest,
        int selected, int updated, int unchanged) { }
