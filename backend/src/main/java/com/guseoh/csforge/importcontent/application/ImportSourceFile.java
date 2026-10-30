package com.guseoh.csforge.importcontent.application;

/** HTTP multipart 파일을 애플리케이션에서 다루는 불변 입력이다. */
public record ImportSourceFile(String fileName, byte[] content) { }
