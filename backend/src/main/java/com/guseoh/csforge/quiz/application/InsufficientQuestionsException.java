package com.guseoh.csforge.quiz.application;

public class InsufficientQuestionsException extends RuntimeException {

    private final long availableCount;
    private final int requestedCount;

    public InsufficientQuestionsException(long availableCount, int requestedCount) {
        super("Requested " + requestedCount + " questions but only " + availableCount + " are available");
        this.availableCount = availableCount;
        this.requestedCount = requestedCount;
    }

    public long getAvailableCount() {
        return availableCount;
    }

    public int getRequestedCount() {
        return requestedCount;
    }
}
