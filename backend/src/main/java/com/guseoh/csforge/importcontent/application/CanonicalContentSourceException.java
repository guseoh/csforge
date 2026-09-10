package com.guseoh.csforge.importcontent.application;

/** 패키징된 canonical pack을 읽을 수 없음을 나타낸다. */
public class CanonicalContentSourceException extends RuntimeException {
    public CanonicalContentSourceException(String message) {
        super(message);
    }

    public CanonicalContentSourceException(String message, Throwable cause) {
        super(message, cause);
    }
}
