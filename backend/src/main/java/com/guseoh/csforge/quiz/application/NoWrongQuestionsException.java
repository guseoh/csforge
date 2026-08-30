package com.guseoh.csforge.quiz.application;

/**
 * 오답 재시도에 사용할 최종 오답 문항이 없을 때 사용하는 애플리케이션 예외이다.
 */
public class NoWrongQuestionsException extends RuntimeException {

    public NoWrongQuestionsException() {
        super("There are no finalized wrong questions to retry");
    }
}
