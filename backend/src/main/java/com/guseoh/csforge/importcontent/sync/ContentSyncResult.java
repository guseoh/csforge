package com.guseoh.csforge.importcontent.sync;

/** 운영 로그에는 원문이나 학습 기록 대신 실행 집계만 남긴다. */
public record ContentSyncResult(String scope, String sourceSha, String manifestDigest,
        String mode, int changedFiles, int updated, int created, int unchanged) { }
