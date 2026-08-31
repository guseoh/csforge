---
kind: concept
contentKey: java.core.concurrency.platform-virtual-thread
topicContentKey: java.core.concurrency
slug: platform-virtual-thread
title: "Platform and virtual threads"
summary: "Java Thread, platform thread, virtual thread를 구분하고 Java 25의 carrier model을 outdated synchronized pinning 설명 없이 이해한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Thread.html"
    title: "Java SE 25 API: Thread"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Java 25 platform·virtual thread와 carrier 설명 확인
---
# Platform thread와 virtual thread

## 쉬운 진입

Java의 Thread는 실행 흐름을 나타내는 API 타입이다. platform thread는 보통 OS kernel
thread와 1:1로 매핑되어 상대적으로 큰 OS 자원을 사용한다. virtual thread는 Java runtime이
관리하는 가벼운 thread로, 많은 수를 만들고 I/O 대기 중 실행을 양보하는 모델에 맞는다.

## 정확한 메커니즘

~~~
Thread platform = Thread.ofPlatform().start(() -> blockingWork());
Thread virtual = Thread.ofVirtual().start(() -> blockingWork());

try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(() -> callService());
}
~~~

virtual thread는 소수의 platform thread인 carrier 위에서 실행될 수 있지만, virtual
thread 코드가 carrier thread를 직접 관찰하거나 그 이름으로 현재 thread를 얻는 것은 아니다.
Thread.currentThread()는 현재 virtual Thread를 반환한다. virtual thread는 daemon이고,
CPU를 오래 점유하는 계산 작업을 무제한으로 병렬화하는 도구가 아니라 blocking I/O가 많은
작업의 동시성 표현에 적합하다.

Java SE 25 API가 보장하는 것은 Thread와 builder/executor의 의미다. carrier 수, scheduler
구성, OS scheduling은 JDK implementation과 OS의 영역이다. Java 25의 virtual thread를
설명하면서 synchronized를 사용하면 자동으로 항상 carrier에 고정된다는 오래된 설명을
일반 규칙으로 반복해서는 안 된다. 특정 blocking/native 구간의 제약은 현재 API/JDK
문서와 실제 측정으로 확인한다.

## 흔한 오해

- virtual thread가 OS thread라는 뜻은 아니다.
- virtual thread를 쓰면 CPU-bound 계산의 총 처리량이 자동으로 증가하지 않는다.
- 모든 virtual thread가 하나의 carrier에 영구적으로 붙어 있는 구조가 아니다.
