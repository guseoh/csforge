---
kind: concept
contentKey: operating-systems.core.threads.java-virtual-thread-boundary
topicContentKey: operating-systems.core.threads
slug: java-virtual-thread-boundary
title: "Java Virtual Thread Boundary"
summary: "virtual thread와 carrier OS thread의 관계 및 pinning 경계를 설명한다."
level: 3
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Thread.html"
    title: "Thread (Java SE 25 API)"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Java 25 virtual thread의 scheduler·carrier 관계와 CPU-bound 경계를 확인한다."
    displayOrder: 1
  - url: "https://openjdk.org/jeps/491"
    title: "Synchronize Virtual Threads without Pinning"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Java 24부터 synchronized blocking과 native·foreign 호출의 pinning 경계를 확인한다."
    displayOrder: 2
---
# Java Virtual Thread Boundary

Java 25의 virtual thread는 JVM이 scheduler를 통해 carrier platform thread에서 실행하는 user-mode thread다. blocking이 지원되는 지점에서는 virtual thread가 park되어 carrier를 다른 작업에 양보할 수 있어 I/O concurrency를 단순화하지만, CPU-bound 작업을 더 빠르게 만드는 추가 CPU는 제공하지 않는다.

Java 24부터 지원되는 일반적인 `synchronized` blocking은 virtual thread가 carrier를 붙잡는 pinning의 원인으로 일반화하면 안 된다. 반면 native code나 foreign function 호출처럼 JVM이 중단할 수 없는 구간은 여전히 carrier를 오래 점유할 수 있다. virtual thread가 OS thread와 같다고 가정하지 말고 blocking 경계, thread-local 비용, executor 정책을 확인한다.

Spring MVC에서 virtual thread를 선택할 때 DB connection pool과 downstream capacity는 그대로 병목이 된다. thread 수가 늘었다는 이유로 DB pool이나 retry를 같이 늘리지 않는다.
