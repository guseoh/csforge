---
kind: concept
contentKey: java.core.concurrency.platform-virtual-thread
topicContentKey: java.core.concurrency
slug: platform-virtual-thread
title: "Platform Thread와 Virtual Thread"
summary: "platform thread와 virtual thread의 자원 모델을 구분하고 I/O 중심 백엔드에서 virtual thread가 유리한 이유를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Thread.html"
    title: "Java SE 25 API: Thread"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Java 25 platform thread와 virtual thread의 Thread API 계약 확인
  - url: "https://openjdk.org/jeps/491"
    title: "JEP 491: Synchronize Virtual Threads without Pinning"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: JDK 24부터 synchronized가 virtual thread를 carrier에 pin하지 않도록 바뀐 구현 경계 확인
  - url: "https://d2.naver.com/news/1203723"
    title: "네이버 D2: Virtual Thread의 기본 개념 이해하기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 3
    relationNote: Java thread와 Executor를 운영 관점에서 연결해 이해
---
# Platform Thread와 Virtual Thread

Platform thread와 virtual thread는 둘 다 `java.lang.Thread`이지만 **실행을 뒷받침하는 자원 모델과 scheduling 방식이 다릅니다.** 이 차이 때문에 virtual thread는 특히 blocking I/O가 많은 서버에서 많은 동시 작업을 thread-per-task 스타일로 표현하기 좋습니다.

![Virtual Thread와 carrier platform thread의 실행 관계](/learning/java/virtual-thread-carriers.svg)

### Platform thread는 보통 OS thread와 밀접하게 연결된다

Java 25 문서는 platform thread를 일반적으로 OS kernel thread와 1:1로 연결되는 thread로 설명합니다.

```text
Java platform thread A ── OS thread A
Java platform thread B ── OS thread B
Java platform thread C ── OS thread C
```

그래서 platform thread를 매우 많이 만들면 stack과 native resource, OS scheduling 비용이 함께 커질 수 있습니다. 이 때문에 전통적인 server에서는 제한된 worker thread pool을 두고 task를 재사용 가능한 worker에 할당하는 구조가 흔합니다.

### Virtual thread는 Java runtime이 scheduling한다

```java
Thread virtual = Thread.ofVirtual().start(this::handleRequest);
```

Virtual thread 역시 `Thread` 객체이지만 특정 OS thread 하나에 생명주기 전체가 고정되지 않습니다. Java runtime이 실행할 때 platform thread에 mount하고, 이 platform thread가 **carrier** 역할을 합니다.

```text
Virtual A ─┐
Virtual B ─┼── runtime scheduler ── carrier platform thread 1
Virtual C ─┤                    └─ carrier platform thread 2
Virtual D ─┘
```

애플리케이션은 carrier의 identity나 정확한 개수를 correctness 계약으로 사용하면 안 됩니다. 그것은 JDK 구현과 runtime scheduling의 영역입니다.

### Blocking I/O 중 virtual thread는 carrier를 양보할 수 있다

지원되는 blocking I/O에서 virtual thread가 기다리게 되면 runtime은 virtual thread를 suspend하고 carrier를 다른 virtual thread 실행에 사용할 수 있습니다.

```text
Virtual A
  ├─ Java code 실행 -> carrier 사용
  ├─ blocking I/O 대기
  │       └─ unmount -> carrier를 다른 task에 사용 가능
  └─ I/O 준비 -> 다시 scheduling
```

이 때문에 callback/event-loop 스타일로 코드를 크게 바꾸지 않고도 많은 대기 작업을 표현할 수 있습니다.

하지만 virtual thread가 작업을 더 빨리 계산한다는 뜻은 아닙니다. **I/O를 기다리는 thread의 비용을 낮추는 것과 CPU 계산량을 줄이는 것은 다른 문제**입니다.

### Virtual thread는 CPU parallelism을 늘리지 않는다

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 100_000; i++) {
        executor.submit(this::heavyCpuCalculation);
    }
}
```

CPU-bound task를 매우 많이 만들더라도 CPU core 수 자체가 늘어나는 것은 아닙니다. 실제 계산은 제한된 CPU 자원에서 경쟁합니다.

Virtual thread의 대표적인 이점은 **많은 blocking task를 값싼 Thread로 표현해 throughput 확장에 도움을 주는 것**입니다. CPU-bound 병렬 계산의 기본 해법으로 thread 수를 크게 늘리는 기능은 아닙니다.

### Virtual thread를 작은 fixed pool로 재사용하지 않는다

Platform thread에서는 thread 자체가 비싸기 때문에 pool 크기로 동시성을 제한하는 경우가 많습니다. Virtual thread는 task마다 새 thread를 만드는 사용 모델을 지원하기 위해 설계되었습니다.

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(this::callDatabase);
    executor.submit(this::callRemoteApi);
}
```

제한해야 하는 것은 virtual thread 개수 자체보다 **실제로 희소한 자원**일 수 있습니다.

```text
many virtual tasks
    │
    ├─ CPU cores
    ├─ DB connections
    └─ external API quota
```

DB가 connection 20개만 허용한다면 virtual thread를 수만 개 만들 수 있어도 DB 동시 사용량은 별도의 connection pool이나 Semaphore 같은 정책으로 제한해야 합니다.

### Java 25에서는 synchronized가 대표적인 pinning 원인이 아니다

초기 virtual thread 구현에서는 `synchronized` monitor를 보유한 상태에서 blocking할 때 carrier에 pin될 수 있었습니다. JDK 24의 JEP 491은 monitor 구현을 변경해 **synchronized 때문에 발생하던 이 pinning 제약을 제거**했습니다.

따라서 Java 25 기준으로 "virtual thread에서는 synchronized를 쓰면 carrier가 반드시 pin된다"고 설명하면 오래된 구현 정보를 현재 계약처럼 전달하게 됩니다.

현재 Java 25 가이드는 virtual thread가 native method 또는 foreign function을 실행하는 동안에는 carrier에 pin될 수 있다고 설명합니다. Pinning은 correctness 오류는 아니지만 오래 blocking하면 scalability를 낮출 수 있습니다.

```text
ordinary virtual-thread-aware blocking I/O
→ carrier 양보 가능

native / foreign call 동안 blocking
→ carrier pinning 가능
```

### ThreadLocal도 자원 모델에 맞춰 다시 본다

Virtual thread도 `ThreadLocal`을 지원합니다. 하지만 virtual thread를 매우 많이 만들 수 있기 때문에 각 thread에 크고 비싼 reusable object를 cache하는 패턴은 메모리 이점을 줄일 수 있습니다.

요청 ID처럼 one-way context를 전달하는 목적이라면 Java 25의 `ScopedValue`도 검토할 수 있습니다. 이것은 ThreadLocal이 virtual thread에서 동작하지 않는다는 뜻이 아니라 **thread-per-task 모델에서 context와 cache의 수명을 다시 설계하라는 의미**입니다.

Platform thread와 virtual thread를 비교할 때는 "어느 쪽이 더 빠른가"보다 작업이 CPU-bound인지 blocking I/O 중심인지, 제한해야 할 실제 자원이 무엇인지, blocking 중 carrier를 양보할 수 있는지부터 확인하세요. Virtual thread는 Java의 동시성 표현 비용을 낮추지만 CPU·DB·외부 시스템의 실제 capacity까지 늘려 주지는 않습니다.
