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
  - url: "https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html"
    title: "Virtual Threads — Java Documentation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "virtual thread와 carrier의 경계를 확인한다."
    displayOrder: 1
---
# Java Virtual Thread Boundary

Java virtual thread는 많은 논리 thread를 소수의 carrier platform thread에서 실행하도록 JVM이 scheduling한다. blocking이 지원되는 지점에서는 carrier를 park하고 다른 virtual thread가 실행할 수 있어 I/O concurrency를 단순화한다.

synchronized 내부의 긴 blocking이나 native 호출 같은 pinning은 carrier를 오래 점유할 수 있다. virtual thread가 OS thread와 같다고 가정하지 말고 blocking 경계, thread-local 비용, executor 정책을 확인한다.

### Backend 연결

Spring MVC에서 virtual thread를 선택할 때 DB connection pool과 downstream capacity는 그대로 병목이 된다. thread 수가 늘었다는 이유로 DB pool이나 retry를 같이 늘리지 않는다.

