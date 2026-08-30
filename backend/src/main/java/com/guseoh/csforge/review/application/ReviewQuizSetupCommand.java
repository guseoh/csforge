package com.guseoh.csforge.review.application;

/**
 * 복습 퀴즈 생성 요청의 애플리케이션 명령 모델이다.
 */
public record ReviewQuizSetupCommand(int count) {

    public ReviewQuizSetupCommand {
        if (count < 1 || count > 50) throw new IllegalArgumentException("count must be between 1 and 50");
    }
}
