package com.guseoh.csforge.quiz.config;

import java.time.Clock;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class QuizConfiguration {

    @Bean
    public Clock quizClock() {
        return Clock.systemUTC();
    }
}
