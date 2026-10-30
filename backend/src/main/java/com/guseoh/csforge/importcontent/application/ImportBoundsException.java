package com.guseoh.csforge.importcontent.application;

/** local import의 파일 수/크기 한도를 위반한 입력이다. */
public class ImportBoundsException extends RuntimeException {
    public ImportBoundsException(String message) { super(message); }
}
