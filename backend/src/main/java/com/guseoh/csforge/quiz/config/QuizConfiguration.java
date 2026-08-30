package com.guseoh.csforge.quiz.config;

import java.time.Clock;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 퀴즈 시간 정책에 사용할 Clock 의존성을 구성하는 설정 클래스이다.
 */
@Configuration
public class QuizConfiguration {

    @Bean
    public Clock quizClock() {
        return Clock.systemUTC();
    }
}
