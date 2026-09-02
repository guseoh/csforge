---
kind: concept
contentKey: operating-systems.core.threads.java-virtual-thread-boundary
topicContentKey: operating-systems.core.threads
slug: java-virtual-thread-boundary
title: "Java Virtual Thread Boundary"
summary: "Java 25 virtual thread와 carrier platform thread, blocking·pinning·downstream 경계를 설명한다."
level: 3
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Thread.html"
    title: "Java SE 25 API: Thread"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
  - url: "https://openjdk.org/jeps/491"
    title: "JEP 491: Synchronize Virtual Threads without Pinning"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
---
# Java Virtual Thread Boundary

### virtual thread는 OS thread를 더 많이 만드는 기능이 아니다

Java virtual thread는 JVM이 scheduling하는 lightweight `Thread` 구현이다. virtual thread가 CPU에서 실제로 실행될 때는 platform thread인 **carrier** 위에 mount되어 실행된다. 수많은 virtual thread를 만들 수 있어도 같은 순간 CPU에서 Java code를 실행하는 parallelism은 carrier와 CPU resource의 제약을 받는다.

```
virtual A ─┐
virtual B ─┼─ JVM scheduler → carrier platform threads → OS scheduler → CPU
virtual C ─┘
```

이 구조 때문에 virtual thread의 핵심 이점은 CPU-bound 계산을 자동 병렬화하는 것이 아니라, **thread-per-task 스타일을 유지하면서 blocking I/O가 많은 workload의 concurrency 비용을 낮추는 것**에 있다.

### blocking 시 carrier를 양보할 수 있다

JVM이 지원하는 blocking operation에서 virtual thread가 기다려야 하면 JVM은 virtual thread를 park하고 carrier를 다른 runnable virtual thread에 사용할 수 있다. platform thread 하나가 blocking I/O 동안 OS에서 계속 잠든 채 worker slot을 차지하는 모델과 다른 점이다.

하지만 모든 blocking 지점이 동일하게 처리되는 것은 아니다. native code나 foreign function처럼 JVM이 virtual thread execution을 안전하게 unmount할 수 없는 구간에서는 carrier가 오래 점유될 수 있다. 따라서 문제가 생겼을 때 `virtual thread인데 왜 carrier가 부족하지?`라고 보기보다 실제 blocking/pinning 지점을 확인해야 한다.

### `synchronized` pinning 설명은 Java 24 이후 달라졌다

초기 virtual thread 구현에서는 `synchronized` monitor를 보유한 채 blocking하면 carrier pinning이 중요한 제약이었다. JEP 491이 JDK 24에 반영되면서 일반적인 `synchronized` method/block 때문에 virtual thread가 carrier에 pinning되는 제약은 제거되었다.

따라서 Java 25 기준 콘텐츠에서 `synchronized 안에서 blocking하면 virtual thread가 carrier를 pin한다`고 일반화하면 잘못된 설명이다. 여전히 native/foreign call 등 남은 pinning 또는 carrier 점유 경계는 따로 확인해야 한다.

### virtual thread 수와 외부 resource 수를 분리한다

virtual thread를 100,000개 만들 수 있다고 DB connection을 100,000개 열 수 있는 것은 아니다. DB pool이 20이면 동시에 DB work를 수행하는 task는 결국 그 capacity를 두고 경쟁한다. downstream가 병목인데 virtual thread 수만 늘리면 queueing 위치만 JVM thread 대기 쪽으로 이동할 수 있다.

Spring MVC에서 virtual thread를 도입할 때도 CPU utilization, carrier saturation, DB connection wait, external API limit, task latency를 함께 봐야 한다. virtual thread는 resource limit을 제거하는 기술이 아니라 blocking concurrency의 execution cost를 바꾸는 기술이다.

### ThreadLocal 비용도 달라진다

virtual thread마다 독립적인 thread-local value를 둘 수 있지만 thread 수가 매우 많다면 per-thread state의 memory 비용도 커질 수 있다. platform-thread pool에서의 ThreadLocal 재사용 문제와 virtual thread의 대량 생성 비용은 같은 문제는 아니므로 lifecycle을 구분해서 판단한다.
