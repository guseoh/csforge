package com.guseoh.csforge.importcontent.application;

/** Preview 이후 canonical 상태가 바뀌어 apply를 안전하게 거절하는 예외이다. */
public class ImportPreviewStaleException extends RuntimeException {
    public ImportPreviewStaleException() { super("Import preview is stale; preview again before applying"); }
}
