package com.guseoh.csforge.importcontent.application;

/** 파서가 정규화한 객관식 선택지 입력이다. */
public record NormalizedChoice(String key, String content, int displayOrder) { }
