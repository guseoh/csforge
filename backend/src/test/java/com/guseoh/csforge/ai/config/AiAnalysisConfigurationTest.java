package com.guseoh.csforge.ai.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import com.guseoh.csforge.ai.application.WrongAnswerAnalyzer;
import com.guseoh.csforge.ai.infrastructure.SpringAiWrongAnswerAnalyzer;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import tools.jackson.databind.ObjectMapper;

/** 외부 Ollama 없이 AI provider의 opt-in bean wiring을 검증한다. */
class AiAnalysisConfigurationTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(AiAnalysisConfiguration.class, AdapterConfiguration.class)
            .withBean(ObjectMapper.class, () -> mock(ObjectMapper.class));

    @Test
    void disabledDoesNotRegisterAnalyzer() {
        contextRunner
                .withPropertyValues("csforge.ai.enabled=false")
                .run(context -> assertThat(context).doesNotHaveBean(WrongAnswerAnalyzer.class));
    }

    @Test
    void enabledWithoutChatModelRegistersUnconfiguredAnalyzer() {
        contextRunner
                .withPropertyValues("csforge.ai.enabled=true")
                .run(context -> {
                    assertThat(context).hasSingleBean(WrongAnswerAnalyzer.class);
                    assertThat(context.getBean(WrongAnswerAnalyzer.class).isConfigured()).isFalse();
                });
    }

    @Test
    void enabledWithChatModelRegistersConfiguredAnalyzer() {
        contextRunner
                .withPropertyValues("csforge.ai.enabled=true")
                .withBean(ChatModel.class, () -> mock(ChatModel.class))
                .run(context -> {
                    assertThat(context).hasSingleBean(WrongAnswerAnalyzer.class);
                    assertThat(context.getBean(WrongAnswerAnalyzer.class).isConfigured()).isTrue();
                });
    }

    @Configuration(proxyBeanMethods = false)
    @Import(SpringAiWrongAnswerAnalyzer.class)
    static class AdapterConfiguration {
    }
}
