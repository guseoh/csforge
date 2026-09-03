package com.guseoh.csforge.ai.application;

/** 현재 local AI provider가 비활성화되었거나 구성되지 않았음을 나타낸다. */
public class AiProviderNotConfiguredException extends RuntimeException {

    public AiProviderNotConfiguredException() {
        super("AI provider is not configured");
    }
}
