package com.guseoh.csforge.quiz.application;

/**
 * 퀴즈 생성 요청 키의 고유 제약 경합을 나타내는 내부 예외이다.
 */
final class QuizSessionCreationRaceException extends RuntimeException {

    QuizSessionCreationRaceException(Throwable cause) {
        super(cause);
    }
}
