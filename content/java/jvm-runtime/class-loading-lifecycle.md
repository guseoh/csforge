---
kind: concept
contentKey: java.core.jvm-runtime.class-loading-lifecycle
topicContentKey: java.core.jvm-runtime
slug: class-loading-lifecycle
title: 클래스 로딩, linking, 초기화
summary: JVM이 클래스를 사용 가능하게 만드는 단계를 구분하고 static 초기화 위험을 이해한다
level: 3
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-5.html"
    title: "Java Virtual Machine Specification 5장: Loading, Linking, and Initialization"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 로딩·검증·준비·해석·초기화 순서 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html"
    title: "Java Language Specification 12장: Execution"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 클래스 초기화 시점과 초기화 순서 확인
---
# 클래스 생명주기

JVM 관점에서 클래스는 대략 loading, linking, initialization 단계를 거칩니다. linking에는 검증(바이트코드 구조와 안전성 확인), 준비(static 필드의 기본값 준비), 필요 시 symbolic reference 해석이 포함됩니다. 초기화에서는 static 필드 초기화와 static initializer가 실행됩니다.

모든 클래스가 프로그램 시작 순간 한꺼번에 초기화되는 것은 아닙니다. 보통 적극적인 사용이 계기가 되어 초기화되며, 정확한 트리거와 순서는 언어·JVM 명세를 확인해야 합니다. 초기화 중 예외가 발생하면 `ExceptionInInitializerError`나 후속 초기화 실패처럼 복구가 어려운 상태가 될 수 있습니다.

클래스 로더는 이름만으로 충분하지 않은 타입 정체성도 제공합니다. 같은 binary name이라도 서로 다른 class loader가 정의한 클래스는 다른 타입으로 취급될 수 있습니다. 애플리케이션 서버·플러그인·테스트 격리에서 이 사실이 중요합니다.
