package com.guseoh.csforge.importcontent.application;

import java.util.List;

/** Preview 또는 apply 유스케이스의 파일 묶음 입력이다. */
public record ImportFilesCommand(List<ImportSourceFile> files) {
    public ImportFilesCommand { files = List.copyOf(files); }
}
