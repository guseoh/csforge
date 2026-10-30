package com.guseoh.csforge.ai.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/** AI analysis configuration properties를 Spring context에 등록한다. */
@Configuration
@EnableConfigurationProperties(AiAnalysisProperties.class)
public class AiAnalysisConfiguration {
}
