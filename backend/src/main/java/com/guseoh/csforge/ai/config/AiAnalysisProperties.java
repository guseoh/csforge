package com.guseoh.csforge.ai.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** durable AI analysis processor와 local provider에 필요한 운영 설정이다. */
@ConfigurationProperties(prefix = "csforge.ai")
public class AiAnalysisProperties {

    private boolean enabled;
    private String provider = "ollama";
    private String model = "llama3.2";
    private String promptVersion = "v1";
    private String schemaVersion = "v1";
    private int maxProcessingAttempts = 3;
    private Duration retryInitialDelay = Duration.ofSeconds(5);
    private Duration retryMaxDelay = Duration.ofMinutes(5);
    private Duration processingLease = Duration.ofMinutes(5);
    private long processorDelayMs = 1_000L;
    private int processorBatchSize = 20;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getPromptVersion() {
        return promptVersion;
    }

    public void setPromptVersion(String promptVersion) {
        this.promptVersion = promptVersion;
    }

    public String getSchemaVersion() {
        return schemaVersion;
    }

    public void setSchemaVersion(String schemaVersion) {
        this.schemaVersion = schemaVersion;
    }

    public int getMaxProcessingAttempts() {
        return maxProcessingAttempts;
    }

    public void setMaxProcessingAttempts(int maxProcessingAttempts) {
        this.maxProcessingAttempts = maxProcessingAttempts;
    }

    public Duration getRetryInitialDelay() {
        return retryInitialDelay;
    }

    public void setRetryInitialDelay(Duration retryInitialDelay) {
        this.retryInitialDelay = retryInitialDelay;
    }

    public Duration getRetryMaxDelay() {
        return retryMaxDelay;
    }

    public void setRetryMaxDelay(Duration retryMaxDelay) {
        this.retryMaxDelay = retryMaxDelay;
    }

    public Duration getProcessingLease() {
        return processingLease;
    }

    public void setProcessingLease(Duration processingLease) {
        this.processingLease = processingLease;
    }

    public long getProcessorDelayMs() {
        return processorDelayMs;
    }

    public void setProcessorDelayMs(long processorDelayMs) {
        this.processorDelayMs = processorDelayMs;
    }

    public int getProcessorBatchSize() {
        return processorBatchSize;
    }

    public void setProcessorBatchSize(int processorBatchSize) {
        this.processorBatchSize = processorBatchSize;
    }
}
