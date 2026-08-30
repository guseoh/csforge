---
kind: concept
contentKey: java.core.jvm-runtime.source-bytecode-execution
topicContentKey: java.core.jvm-runtime
slug: source-bytecode-execution
title: 소스, 바이트코드, JVM 실행
summary: Java 소스가 컴파일과 JVM 실행을 거치는 큰 흐름을 이해한다
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-1.html"
    title: "Java Virtual Machine Specification 1장: The Java Virtual Machine"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: JVM의 추상 기계와 class 파일 개요 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-13.html"
    title: "Java Language Specification 13장: Binary Compatibility"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 컴파일 결과와 바이너리 호환성 배경 확인
---
# 소스에서 JVM 실행까지

Java 소스는 컴파일러가 class 파일의 바이트코드로 변환하고, JVM이 그 바이트코드를 로드·검증·실행합니다. JVM은 특정 운영체제와 CPU에 종속된 소스 실행을 줄이고, 같은 class 파일 형식을 여러 구현이 실행할 수 있게 하는 추상 실행 환경입니다.

```text
Hello.java -> javac -> Hello.class -> class loader/linker -> JVM 실행
```

바이트코드는 CPU 명령어와 동일하지 않습니다. JVM 구현은 인터프리터로 실행하거나 자주 실행되는 코드를 JIT 컴파일러로 네이티브 코드로 바꿀 수 있습니다. 이 과정은 Java 언어가 보장하는 의미와 JVM 구현의 최적화를 구분해 이해해야 합니다.

컴파일 성공은 모든 실행 시점 실패가 없다는 뜻이 아닙니다. 클래스 탐색, 접근, 초기화, 외부 자원 연결은 실행 중에 일어나며 각각 다른 오류 경계를 가집니다.
