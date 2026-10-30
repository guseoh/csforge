package com.guseoh.csforge.importcontent.application;

import java.util.List;

/** canonical pack을 애플리케이션 입력으로 제공하는 실행 환경 경계이다. */
public interface CanonicalContentSource {
    List<CanonicalContentFile> load();
}
