package com.guseoh.csforge.review.application;

/**
 * 복습 퀴즈 생성 요청의 애플리케이션 명령 모델이다.
 */
public record ReviewQuizSetupCommand(
        int count,
        String areaSlug,
        Long topicId,
        Short level,
        boolean includeUpcoming) {

    public ReviewQuizSetupCommand {
        if (count < 1 || count > 50) throw new IllegalArgumentException("count must be between 1 and 50");
        if (level != null && (level < 1 || level > 3)) throw new IllegalArgumentException("level must be between 1 and 3");
        areaSlug = areaSlug == null || areaSlug.isBlank() ? null : areaSlug.trim();
    }

    public ReviewQuizSetupCommand(int count) {
        this(count, null, null, null, false);
    }

    public boolean hasFiltersOrUpcoming() {
        return areaSlug != null || topicId != null || level != null || includeUpcoming;
    }
}
