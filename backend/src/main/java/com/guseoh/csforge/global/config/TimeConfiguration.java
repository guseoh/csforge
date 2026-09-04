package com.guseoh.csforge.global.config;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** 애플리케이션의 기준 시각과 학습용 timezone을 구성한다. */
@Configuration
public class TimeConfiguration {

    @Bean
    public ZoneId studyZoneId(@Value("${csforge.time-zone:Asia/Seoul}") String timeZone) {
        return ZoneId.of(timeZone);
    }

    @Bean
    public Clock applicationClock(ZoneId studyZoneId) {
        return Clock.system(studyZoneId);
    }
}
