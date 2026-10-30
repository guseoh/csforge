package com.guseoh.csforge.ai.application;

/** provider 호출 실패를 retry 가능 여부와 안전한 저장 메시지로 전달한다. */
public class WrongAnswerAnalysisProviderException extends RuntimeException {

    private final String errorCode;
    private final boolean retryable;

    public WrongAnswerAnalysisProviderException(String errorCode, String message, boolean retryable) {
        super(message);
        this.errorCode = errorCode;
        this.retryable = retryable;
    }

    public WrongAnswerAnalysisProviderException(String errorCode, String message, boolean retryable, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.retryable = retryable;
    }

    public String errorCode() {
        return errorCode;
    }

    public boolean retryable() {
        return retryable;
    }
}
