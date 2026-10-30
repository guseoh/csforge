package com.guseoh.csforge.importcontent.application;

/** 수동 import와 canonical bootstrap이 공유하는 batch 상한이다. */
public final class ImportBatchLimits {
    public static final int MAX_FILES_PER_BATCH = 100;
    public static final int MAX_ITEMS_PER_BATCH = 1_000;
    public static final int MAX_FILE_BYTES = 2 * 1024 * 1024;
    public static final long MAX_TOTAL_BYTES = 20L * 1024 * 1024;

    private ImportBatchLimits() {
    }
}
