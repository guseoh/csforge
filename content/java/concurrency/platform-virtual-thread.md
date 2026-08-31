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
---
# Platform thread와 virtual thread

전통적인 Java server는 요청을 처리하기 위해 platform thread를 사용해 왔습니다. 문제는 DB나 외부 HTTP 응답을 기다리는 동안 thread가 오랫동안 아무 계산도 하지 않을 수 있다는 점입니다. Platform thread는 OS thread와 밀접하게 연결되는 비교적 무거운 자원이므로 수를 무제한으로 늘릴 수 없습니다.

Virtual thread는 **Java runtime이 매우 많은 동시 작업을 thread-per-task 방식으로 표현하기 쉽게 만든 가벼운 Thread**입니다. 특히 blocking I/O가 많은 backend code에서 기존의 순차적인 코딩 스타일을 유지하면서 더 많은 대기 작업을 다루는 것이 목표입니다.

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

따라서 "virtual thread는 Thread가 아니다"가 아니라 **Thread를 실행하는 비용과 runtime 관리 방식이 다르다**고 이해하는 편이 정확합니다.

### platform thread는 OS thread와 밀접하게 연결된다

Platform thread는 일반적으로 OS kernel thread와 1:1로 대응되는 방식으로 구현됩니다. OS는 이 thread들을 scheduling하고 각 thread는 native stack 같은 자원을 사용합니다.

```text
Java platform Thread A ── OS Thread A
Java platform Thread B ── OS Thread B
Java platform Thread C ── OS Thread C
```

이 때문에 수천·수만 개의 platform thread를 무작정 만드는 것은 메모리와 scheduling 비용을 키울 수 있습니다.

### virtual thread는 carrier platform thread 위에서 실행될 수 있다

Virtual thread는 실행할 때 carrier 역할을 하는 platform thread에 mount되고, 특정 blocking 작업에서 실행을 계속할 필요가 없으면 unmount되어 carrier를 다른 virtual thread가 사용할 수 있습니다.

```text
Virtual A ─┐
Virtual B ─┼── Java runtime scheduler ── Carrier 1 ── OS Thread
Virtual C ─┤                           └─ Carrier 2 ── OS Thread
Virtual D ─┘
```

중요한 것은 virtual thread 하나가 특정 carrier에 평생 고정되는 구조가 아니라는 점입니다. Carrier 수나 scheduler의 세부 구성은 JDK implementation 영역이므로 애플리케이션 계약처럼 가정하지 않습니다.

### I/O를 기다리는 동안 carrier를 다른 작업에 활용할 수 있다

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    Future<String> a = executor.submit(this::callDatabase);
    Future<String> b = executor.submit(this::callExternalApi);
}
```

각 task는 별도의 virtual thread에서 blocking style로 작성할 수 있습니다. DB 응답을 기다리는 virtual thread가 실행 자원을 양보할 수 있다면 carrier는 다른 virtual thread의 코드를 실행할 수 있습니다.

이것이 event-loop 스타일로 callback을 직접 이어 붙이지 않고도 많은 I/O 동시 작업을 표현할 수 있는 이유입니다.

### virtual thread는 CPU를 늘려 주는 기능이 아니다

```java
for (int i = 0; i < 1_000_000; i++) {
    executor.submit(this::heavyCpuCalculation);
}
```

CPU-bound 작업을 백만 개의 virtual thread로 만들었다고 CPU core가 백만 개가 되는 것은 아닙니다. 실제 계산은 제한된 CPU 자원에서 실행됩니다.

Virtual thread의 주된 강점은 **대기하는 동시 작업의 thread 비용을 낮추는 것**이지 CPU-bound 계산의 병렬 처리량을 무한히 늘리는 것이 아닙니다.

### 오래된 `synchronized` pinning 설명을 Java 25에 그대로 적용하면 안 된다

초기 virtual thread 구현에서는 `synchronized` 영역에서 blocking하면 carrier에서 unmount되지 못하는 대표적인 pinning 제약이 있었습니다. 하지만 JDK 24에서 synchronized와 관련한 pinning 제한이 크게 개선되었고 Java 25를 기준으로 공부할 때는 "synchronized를 쓰면 virtual thread가 항상 carrier를 붙잡는다"는 설명을 일반 규칙으로 사용하면 안 됩니다.

여전히 native/foreign 호출 등 현재 runtime에서 별도 제약이 있을 수 있으므로 성능 문제를 분석할 때는 **현재 JDK 문서와 실제 측정 결과**를 확인해야 합니다.

### thread pool 사고방식을 그대로 적용하지 않는다

Platform thread에서는 비싼 thread 수를 제한하기 위해 fixed pool을 사용하는 경우가 많습니다. Virtual thread는 "task마다 thread"를 저렴하게 만드는 것이 목적이므로 thread 자체를 제한 자원처럼 작은 pool에 재사용하는 방식이 핵심 사용법은 아닙니다.

대신 DB connection, 외부 API 동시 요청 수처럼 **진짜 제한된 자원**은 Semaphore나 connection pool 같은 별도 수단으로 제한해야 합니다.

```text
virtual threads: 많은 task를 표현
      │
      └─ DB 작업 -> DB connection pool이라는 실제 제한은 그대로 존재
```

### 문제를 풀 때 확인할 것

1. 현재 Thread가 platform인지 virtual인지 확인합니다.
2. 작업이 CPU-bound인지 blocking I/O가 많은지 봅니다.
3. virtual thread 수와 실제 CPU 병렬성은 분리합니다.
4. 제한해야 할 자원이 thread 자체인지 DB connection 같은 외부 자원인지 확인합니다.
5. pinning 관련 설명은 Java 버전과 현재 JDK 기준인지 확인합니다.

### 자주 헷갈리는 부분

- virtual thread는 OS thread를 하나씩 새로 만드는 모델이 아닙니다.
- virtual thread를 많이 만들면 CPU core가 늘어나는 것은 아닙니다.
- virtual thread 하나가 하나의 carrier에 영구적으로 묶이지 않습니다.
- Java 25에서 `synchronized`를 무조건 오래된 pinning 문제로 설명하면 부정확합니다.

### 면접에서 설명한다면

Platform thread는 OS thread와 밀접하게 대응하는 비교적 비싼 실행 자원인 반면 virtual thread는 JDK runtime이 관리하는 가벼운 Thread라서 많은 blocking I/O task를 thread-per-task 방식으로 표현하기 좋다고 설명할 수 있습니다. Virtual thread는 carrier platform thread 위에서 실행되고 blocking 시 carrier를 양보할 수 있지만 CPU 자원 자체를 늘리는 기능은 아닙니다. 또한 DB connection처럼 실제 제한된 자원은 별도로 제어해야 합니다.
