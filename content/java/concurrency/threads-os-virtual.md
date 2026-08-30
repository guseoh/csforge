---
kind: concept
contentKey: java.core.concurrency.threads-os-virtual
topicContentKey: java.core.concurrency
slug: threads-os-virtual
title: Java thread, OS thread, virtual thread
summary: Java의 실행 단위와 운영체제 스케줄링, virtual thread의 책임 범위를 구분한다
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Thread.html"
    title: Thread API
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: platform thread와 virtual thread API 확인
  - url: "https://docs.oracle.com/en/java/javase/25/core/virtual-threads.html"
    title: Virtual Threads (Java Platform, SE 25)
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: virtual thread의 사용 모델과 주의점 확인
---
# Java thread와 virtual thread

Java `Thread`는 Java 프로그램에서 실행 흐름을 표현합니다. 플랫폼 스레드는 일반적으로 운영체제의 native thread와 연결되며 OS가 CPU 실행을 스케줄링합니다. 구체적인 매핑과 스케줄러 동작은 JVM·OS 구현의 영역이지 Java 코드가 모든 세부를 직접 보장하는 것은 아닙니다.

virtual thread는 많은 동시 작업을 더 적은 플랫폼 스레드 위에서 표현할 수 있는 가벼운 Java 실행 단위입니다. 특히 blocking I/O 중심의 작업을 단순한 thread-per-task 형태로 작성할 때 유용하지만, CPU 코어 수를 늘리거나 공유 상태의 race를 자동으로 없애 주지는 않습니다.

```java
Thread.startVirtualThread(() -> client.fetch());
```

virtual thread를 사용해도 외부 시스템의 연결 수, 동시 요청 제한, synchronized 구간, ThreadLocal 사용, pinning 가능성을 점검해야 합니다. 실행 단위 선택과 데이터 안전성·자원 용량 설계는 서로 다른 문제입니다.
