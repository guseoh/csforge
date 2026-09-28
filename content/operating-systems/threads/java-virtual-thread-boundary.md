---
kind: concept
contentKey: operating-systems.core.threads.java-virtual-thread-boundary
topicContentKey: operating-systems.core.threads
slug: java-virtual-thread-boundary
title: "Java 가상 스레드 경계(Java Virtual Thread Boundary)"
summary: "Java 25 가상 스레드와 운반자 플랫폼 스레드, 블로킹·고정(pinning)·하위 시스템 경계를 설명한다."
level: 3
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Thread.html"
    title: "Java SE 25 API: Thread"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
  - url: "https://openjdk.org/jeps/444"
    title: "JEP 444: Virtual Threads"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "현재 JDK의 platform thread가 OS thread의 thin wrapper로 구현되고 virtual thread와 어떻게 구분되는지 확인한다."
    displayOrder: 2
  - url: "https://openjdk.org/jeps/491"
    title: "JEP 491: Synchronize Virtual Threads without Pinning"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
  - url: "https://docs.oracle.com/en/java/javase/25/core/virtual-threads.html"
    title: "Virtual Threads — Java SE 25"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Java SE 25의 blocking·unmount 동작과 synchronized·native·foreign 구간의 pinning 경계를 확인한다."
    displayOrder: 4
---
# Java 가상 스레드 경계(Java Virtual Thread Boundary)

Java 가상 스레드는 운영체제 스레드를 대량으로 새로 만드는 기능이 아니다. 가상 스레드는 JDK가 스케줄링하는 가벼운 `Thread`이며, CPU에서 실제로 실행될 때는 **운반자 플랫폼 스레드(carrier platform thread)** 위에 올라간다. 플랫폼 스레드는 운영체제 스레드와 대응하고, 최종적인 CPU 시간 배분은 운영체제 스케줄러가 담당한다.

```text
가상 스레드 A ─┐
가상 스레드 B ─┼─ JDK 스케줄러 → 운반자 플랫폼 스레드 → OS 스케줄러 → CPU
가상 스레드 C ─┘
```

따라서 가상 스레드가 매우 많아도 같은 순간 CPU에서 실행할 수 있는 계산량은 운반자 스레드와 CPU 코어 수의 제약을 받는다. 가상 스레드의 주된 이점은 CPU 계산을 자동으로 더 빠르게 만드는 것이 아니라 **블로킹이 많은 작업을 작업당 스레드(thread-per-task) 방식으로 많이 다룰 때 플랫폼 스레드 점유 비용을 줄이는 것**이다.

### 블로킹할 때 운반자 스레드를 다른 가상 스레드에 돌려줄 수 있다

가상 스레드가 JDK가 지원하는 블로킹 연산에서 기다리면 런타임은 가상 스레드를 운반자 스레드에서 분리(unmount)하고, 그 운반자 스레드를 다른 실행 가능한 가상 스레드에 사용할 수 있다. 기다리던 조건이 충족되면 가상 스레드는 다시 스케줄러에 제출되고 어떤 운반자 스레드에든 다시 올라가 실행을 이어간다.

```text
가상 스레드 A가 운반자 1에서 실행
        │ 블로킹
        ▼
A를 운반자에서 분리
운반자 1 → 가상 스레드 B 실행
        │
A가 기다리던 이벤트 완료
        ▼
A 다시 실행 가능 → 운반자에 재탑재 → 실행 재개
```

즉 가상 스레드 하나가 수명 전체 동안 특정 운반자 스레드 하나에 고정되는 것은 아니다.

### 고정(pinning)은 가상 스레드와 운반자 스레드가 함께 묶이는 경우다

가상 스레드를 운반자에서 분리할 수 없는 상태에서 블로킹하면 운반자 스레드도 함께 점유될 수 있다. 다만 Java 25에서는 예전 설명을 그대로 사용하면 안 된다. JEP 491이 JDK 24에 반영되면서 **일반적인 `synchronized` 메서드·블록 때문에 발생하던 모니터 고정(pinning)이 제거**되었기 때문이다.

따라서 `synchronized 안에서 블로킹하면 가상 스레드가 항상 운반자를 고정한다`는 설명은 Java 25 기준으로 부정확하다. 네이티브 메서드나 foreign function처럼 여전히 운반자와의 결합이 필요한 구간은 별도로 확인해야 한다.

### 가상 스레드는 다른 자원의 한계까지 없애지 않는다

가상 스레드를 많이 만들 수 있어도 CPU 코어, 파일 디스크립터, 데이터베이스 연결, 원격 서비스 처리 용량 같은 자원이 늘어나는 것은 아니다. 스레드를 싸게 만들 수 있다고 해서 하위 시스템의 작업까지 무제한으로 병렬화할 수 있는 것은 아니다.

Java 가상 스레드 경계의 핵심은 **가상 스레드는 JDK의 스케줄링 단위이고 운반자 플랫폼 스레드는 운영체제 스케줄링과 연결되는 실행 단위라는 층을 구분하는 것**, 그리고 블로킹 시 운반자에서 분리할 수 있는 경우와 함께 점유하는 경우를 구분하는 것이다.