package com.guseoh.csforge.importcontent.application;

/** dependency 순서와 기존 import 상한을 만족하는 bootstrap batch이다. */
public record CanonicalBootstrapBatch(int sequence, ImportItemKind kind, ImportFilesCommand command, int itemCount) {
}
