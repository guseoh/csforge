package com.guseoh.csforge.quiz.application;

import lombok.Getter;

/**
 * 요청한 Quiz 문항 수보다 선택 가능한 문항이 적을 때 사용하는 애플리케이션 예외이다.
 */
@Getter
public class InsufficientQuestionsException extends RuntimeException {

    private final long availableCount;
    private final int requestedCount;

    public InsufficientQuestionsException(long availableCount, int requestedCount) {
        super("Requested " + requestedCount + " questions but only " + availableCount + " are available");
        this.availableCount = availableCount;
        this.requestedCount = requestedCount;
    }
}
