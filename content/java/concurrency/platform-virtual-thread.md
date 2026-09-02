---
kind: concept
contentKey: java.core.concurrency.platform-virtual-thread
topicContentKey: java.core.concurrency
slug: platform-virtual-thread
title: "Platform and virtual threads"
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
---
# Platform thread와 virtual thread

전통적인 Java server는 요청을 처리하기 위해 platform thread를 사용해 왔습니다. 문제는 DB나 외부 HTTP 응답을 기다리는 동안 thread가 오랫동안 계산하지 않을 수 있다는 점입니다. Java 25 `Thread` API는 platform thread를 **보통 OS kernel thread와 1:1로 매핑되는 thread**로 설명하며, OS가 유지하는 비교적 큰 stack과 다른 자원을 사용할 수 있어 개수를 무제한으로 늘릴 수 있는 자원은 아닙니다.

Virtual thread는 **Java runtime이 매우 많은 동시 작업을 thread-per-task 방식으로 표현하기 쉽게 만든 가벼운 `Thread`**입니다. 특히 blocking I/O가 많은 backend code에서 기존의 순차적인 코딩 스타일을 유지하면서 더 많은 대기 작업을 다루는 것이 목적입니다.

### 둘 다 Java에서는 Thread다

```java
Thread platform = Thread.ofPlatform()
        .start(this::work);

Thread virtual = Thread.ofVirtual()
        .start(this::work);
```

두 객체 모두 `Thread` API를 사용합니다. `Thread.currentThread()`를 virtual thread 안에서 호출하면 carrier가 아니라 현재 virtual `Thread`를 반환합니다.

```java
Thread.ofVirtual().start(() -> {
    System.out.println(Thread.currentThread().isVirtual()); // true
});
```

따라서 "virtual thread는 Thread가 아니다"가 아니라 **같은 Thread 추상화를 사용하지만 scheduling과 resource model이 다르다**고 이해하는 편이 정확합니다.

### platform thread는 보통 OS thread와 1:1로 매핑된다

Java 25 API가 말하는 일반적인 platform thread 모델은 다음과 같습니다.

```text
Java platform Thread A ── OS kernel thread A
Java platform Thread B ── OS kernel thread B
Java platform Thread C ── OS kernel thread C
```

이 때문에 platform thread가 많아지면 stack/native resource와 OS scheduling 비용이 함께 증가할 수 있습니다. 다만 이것은 Java language 문법이 아니라 Java runtime/thread 구현 계약의 층위입니다.

### virtual thread는 carrier platform thread 위에서 실행된다

Virtual thread는 Java runtime이 scheduling하며, 실행할 때 carrier 역할을 하는 platform thread에 mount됩니다.

```text
Virtual A ─┐
Virtual B ─┼── Java runtime scheduler ── Carrier 1 ── OS Thread
Virtual C ─┤                           └─ Carrier 2 ── OS Thread
Virtual D ─┘
```

Virtual thread 하나가 특정 carrier에 평생 고정되는 구조가 아닙니다. Java 25 `Thread` API도 carrier의 정확한 수와 scheduler 설정을 JDK reference implementation의 세부로 다룹니다. 애플리케이션이 특정 carrier identity나 고정 개수를 correctness 계약으로 사용하면 안 됩니다.

### blocking I/O가 항상 carrier를 붙잡는 것은 아니다

Virtual thread가 지원되는 blocking I/O에서 기다릴 때 runtime은 해당 virtual thread의 실행을 suspend하고 carrier를 다른 virtual thread에 사용할 수 있습니다.

```text
Virtual A
  ├─ Java code 실행 ── carrier 1 사용
  ├─ blocking I/O 대기
  │       └─ carrier 1 해제 가능
  └─ I/O 준비 후 다시 scheduling
```

이것이 event-loop callback을 직접 이어 붙이지 않고도 많은 I/O 동시 작업을 표현할 수 있는 핵심 이유입니다.

하지만 **모든 종류의 blocking operation이 반드시 unmount된다는 보장**으로 확대하면 안 됩니다. 어떤 operation이 virtual-thread-aware한지, native code를 통과하는지, 현재 JDK 구현이 어떤 제한을 가지는지를 확인해야 합니다.

### Java 25에서 `synchronized`는 더 이상 대표적인 pinning 원인이 아니다

초기 virtual thread 구현에서는 virtual thread가 `synchronized` method/block 안에서 blocking할 때 carrier에 pin될 수 있었습니다. 그러나 JDK 24의 JEP 491에서 monitor implementation이 개선되어, **`synchronized`를 보유한 채 blocking한다는 이유만으로 virtual thread가 carrier에 pin되는 제약은 제거되었습니다.**

따라서 Java 25 기준으로 다음 설명은 틀립니다.

```text
synchronized 사용
    -> virtual thread는 반드시 carrier에 pin된다
```

Java monitor의 mutual exclusion/happens-before semantics는 그대로 유지하면서 runtime의 carrier 관리가 개선된 것입니다. 즉, **언어/JMM의 synchronized 계약과 HotSpot/JDK virtual-thread scheduling 구현을 분리**해야 합니다.

### 현재도 native method와 foreign function에서는 pinning이 생길 수 있다

Java 25의 virtual-thread 가이드는 virtual thread가 **native method 또는 foreign function을 실행하는 동안** carrier에 pin될 수 있다고 설명합니다.

```text
virtual thread
    │
    ├─ ordinary Java blocking I/O -> unmount 가능한 경우가 많음
    │
    └─ native / foreign call
            └─ carrier pinning 가능
```

Pinning이 곧 correctness 오류라는 뜻은 아닙니다. 다만 pinned virtual thread가 오래 blocking하면 carrier를 다른 virtual thread가 사용할 수 없어 scalability가 떨어질 수 있습니다. 이 문제는 JFR의 virtual-thread 관련 event와 실제 thread/latency 관찰로 확인해야 합니다.

### virtual thread는 CPU를 늘려 주는 기능이 아니다

```java
for (int i = 0; i < 1_000_000; i++) {
    executor.submit(this::heavyCpuCalculation);
}
```

CPU-bound 작업을 백만 개의 virtual thread로 만들었다고 CPU core가 백만 개가 되는 것은 아닙니다. 실제 계산은 제한된 CPU 자원에서 실행됩니다.

Virtual thread의 주된 강점은 **많은 blocking task를 값싼 thread 형태로 표현해 throughput 확장에 도움을 주는 것**이지 CPU-bound 계산의 병렬 처리량이나 개별 요청 latency를 자동으로 개선하는 기능이 아닙니다.

### virtual thread를 작은 fixed pool로 재사용하려는 사고를 그대로 가져오지 않는다

Platform thread에서는 thread 자체가 비싼 자원이어서 fixed pool로 개수를 제한하는 경우가 많습니다. Virtual thread는 task마다 thread를 만드는 비용을 낮추는 것이 목적이므로 virtual thread 자체를 작은 pool에 넣어 재사용하는 방식은 핵심 사용 모델과 맞지 않습니다.

대신 DB connection, 외부 API quota처럼 **실제로 희소한 자원**의 동시성을 제한합니다.

```text
많은 virtual tasks
      │
      ├─ CPU core           -> 실제 병렬성 한계
      ├─ DB connection pool -> DB 동시성 한계
      └─ external API quota -> 외부 시스템 한계
```

필요하면 Semaphore, connection pool, rate limit 같은 별도 mechanism을 둡니다.

### ThreadLocal도 "thread가 가벼우니 공짜"가 아니다

Virtual thread도 `ThreadLocal`을 지원합니다. 요청 ID처럼 작은 context를 thread-local로 사용하는 것이 금지되는 것은 아니지만, virtual thread를 매우 많이 만들 수 있으므로 각 thread마다 크고 비싼 reusable object를 ThreadLocal cache로 두는 패턴은 메모리 이점을 훼손할 수 있습니다.

One-way context 전달이 목적이면 Java 25 API가 권장하는 `ScopedValue`를 검토합니다. 이것은 virtual thread가 ThreadLocal을 지원하지 않는다는 뜻이 아니라 **thread-per-task resource model에 맞게 context와 cache 정책을 다시 보라는 의미**입니다.

### 문제를 풀 때 확인할 것

1. 현재 Thread가 platform인지 virtual인지 확인합니다.
2. 작업이 CPU-bound인지 blocking I/O가 많은지 봅니다.
3. virtual thread 수와 실제 CPU 병렬성을 분리합니다.
4. 제한해야 할 자원이 thread 자체인지 DB connection 같은 외부 자원인지 확인합니다.
5. blocking operation이 실제로 virtual thread를 unmount할 수 있는 API인지 확인합니다.
6. Java 25에서 `synchronized`를 오래된 carrier-pinning 규칙으로 설명하지 않습니다.
7. native/foreign call이 오래 blocking하며 pinning을 만드는지 실제 evidence를 봅니다.

### 자주 헷갈리는 부분

- virtual thread도 `java.lang.Thread`입니다.
- virtual thread는 특정 OS thread 하나에 평생 고정되지 않습니다.
- virtual thread를 많이 만들면 CPU core가 늘어나는 것은 아닙니다.
- Java 25에서 `synchronized`는 더 이상 그 자체로 virtual thread를 carrier에 pin하는 대표 원인이 아닙니다.
- native/foreign call에서의 pinning은 여전히 scalability 관찰 대상입니다.
- virtual thread 수를 늘려도 DB connection이나 외부 API capacity는 그대로입니다.

### 면접에서 설명한다면

Platform thread는 보통 OS kernel thread와 1:1로 매핑되는 비교적 비싼 실행 자원인 반면, virtual thread는 Java runtime이 scheduling하는 가벼운 `Thread`라 많은 blocking I/O task를 thread-per-task 방식으로 표현하기 좋습니다. Virtual thread는 carrier platform thread 위에서 실행되며 지원되는 blocking I/O에서는 carrier를 양보할 수 있습니다. JDK 24 이후 `synchronized` 때문에 pin되는 제약은 제거됐지만 native method나 foreign function 실행에서는 pinning이 생길 수 있습니다. 또한 virtual thread는 CPU나 DB connection 같은 실제 희소 자원의 capacity를 늘려 주는 기능은 아닙니다.
