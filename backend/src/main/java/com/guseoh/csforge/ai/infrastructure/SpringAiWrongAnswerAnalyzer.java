package com.guseoh.csforge.ai.infrastructure;

import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.util.concurrent.TimeoutException;

import com.guseoh.csforge.ai.application.WrongAnswerAnalysisInputSnapshot;
import com.guseoh.csforge.ai.application.WrongAnswerAnalysisProviderException;
import com.guseoh.csforge.ai.application.WrongAnswerAnalysisResult;
import com.guseoh.csforge.ai.application.WrongAnswerAnalyzer;
import com.guseoh.csforge.ai.config.AiAnalysisProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

/** Spring AI Ollama ChatModel을 application의 오답 분석 port로 감싸는 local adapter이다. */
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "csforge.ai.enabled", havingValue = "true")
@ConditionalOnBean(ChatModel.class)
public class SpringAiWrongAnswerAnalyzer implements WrongAnswerAnalyzer {

    private final ObjectProvider<ChatModel> chatModelProvider;
    private final ObjectMapper objectMapper;
    private final AiAnalysisProperties properties;

    @Override
    public boolean isConfigured() {
        return chatModelProvider.getIfAvailable() != null;
    }

    @Override
    public WrongAnswerAnalysisResult analyze(WrongAnswerAnalysisInputSnapshot snapshot) {
        ChatModel chatModel = chatModelProvider.getIfAvailable();
        if (chatModel == null) {
            throw new WrongAnswerAnalysisProviderException(
                    "AI_PROVIDER_NOT_CONFIGURED", "AI provider is not configured", false);
        }
        BeanOutputConverter<WrongAnswerAnalysisResult> converter = new BeanOutputConverter<>(WrongAnswerAnalysisResult.class);
        String prompt = createPrompt(snapshot, converter.getFormat());
        ChatResponse response;
        try {
            response = chatModel.call(new Prompt(new UserMessage(prompt)));
        } catch (Exception exception) {
            throw new WrongAnswerAnalysisProviderException(
                    isTransient(exception) ? "AI_PROVIDER_UNAVAILABLE" : "AI_PROVIDER_ERROR",
                    isTransient(exception) ? "AI provider is temporarily unavailable" : "AI provider request failed",
                    isTransient(exception),
                    exception);
        }
        String responseText;
        try {
            responseText = response.getResult().getOutput().getText();
            if (responseText == null || responseText.isBlank()) throw new IllegalArgumentException("empty response");
        } catch (Exception exception) {
            throw new WrongAnswerAnalysisProviderException(
                    "AI_INVALID_OUTPUT", "AI provider returned an invalid response", false, exception);
        }
        try {
            return converter.convert(responseText);
        } catch (Exception exception) {
            throw new WrongAnswerAnalysisProviderException(
                    "AI_INVALID_OUTPUT", "AI provider returned malformed structured output", false, exception);
        }
    }

    private String createPrompt(WrongAnswerAnalysisInputSnapshot snapshot, String format) {
        try {
            return """
                    You are CSForge's wrong-answer learning assistant.
                    Analyze the user's actual submitted answer using the canonical answer and explanation as authoritative.
                    Explain the user's mistake separately from the correct reasoning. Do not modify canonical content.
                    Only return relatedConceptKeys present in the supplied snapshot. Ask educational follow-up questions,
                    not new quiz-bank questions. Return only the requested JSON structure.

                    Immutable input snapshot:
                    %s

                    Prompt version: %s

                    Required structured output format:
                    %s
                    """.formatted(objectMapper.writeValueAsString(snapshot), properties.getPromptVersion(), format);
        } catch (Exception exception) {
            throw new WrongAnswerAnalysisProviderException(
                    "AI_PROMPT_BUILD_FAILED", "AI analysis prompt could not be created", false, exception);
        }
    }

    private static boolean isTransient(Throwable throwable) {
        for (Throwable current = throwable; current != null; current = current.getCause()) {
            if (current instanceof ConnectException
                    || current instanceof SocketTimeoutException
                    || current instanceof TimeoutException) return true;
            String name = current.getClass().getName();
            if (name.contains("ResourceAccessException") || name.contains("TransientAiException")) return true;
        }
        return false;
    }
}
