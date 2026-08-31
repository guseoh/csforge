---
kind: concept
contentKey: java.core.concurrency.concurrency-vs-parallelism
topicContentKey: java.core.concurrency
slug: concurrency-vs-parallelism
title: "Concurrency versus parallelism"
summary: "여러 작업을 겹쳐 진행하는 동시성과 여러 작업이 실제로 동시에 실행되는 병렬성을 구분한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Thread.html"
    title: "Java SE 25 API: Thread"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Java thread와 platform·virtual thread의 실행 모델 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html"
    title: "Java SE 25 JLS Chapter 17: Threads and Locks"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: Java thread와 shared memory 규칙의 언어 수준 경계 확인
---
# Concurrency와 parallelism

서버가 요청 A의 DB 응답을 기다리는 동안 요청 B를 처리한다고 생각해 보겠습니다. 두 요청이 반드시 같은 순간에 서로 다른 CPU core에서 실행되는 것은 아니지만, 애플리케이션 입장에서는 **여러 작업이 겹쳐 진행되고 있습니다.** 이것이 동시성(concurrency)을 이해하는 출발점입니다.

반면 두 작업이 실제로 같은 시각에 서로 다른 실행 자원에서 계산된다면 병렬성(parallelism)이라고 볼 수 있습니다. 두 용어는 자주 함께 나오지만 같은 뜻은 아닙니다.

### 동시성은 여러 작업을 다루는 구조에 가깝다

하나의 CPU core만 있다고 가정해도 여러 작업을 조금씩 번갈아 실행할 수 있습니다.

```text
시간 ─────────────────────────────▶

Task A   [실행]      [실행]            [실행]
Task B        [실행]      [실행]
Task C                     [실행] [실행]
```

한 순간에는 하나만 실행되더라도 전체 시간 범위에서는 여러 작업의 진행이 서로 겹칩니다. 각 작업이 I/O를 기다리거나 실행권을 넘기면 다른 작업이 진행될 수 있습니다.

그래서 동시성의 핵심 질문은 "CPU가 몇 개인가?"보다 **여러 독립적인 작업을 어떤 실행 흐름으로 구성하고 조정할 것인가**에 가깝습니다.

### 병렬성은 같은 순간에 실제 실행이 겹친다

여러 CPU core가 있다면 서로 다른 작업이 실제로 동시에 계산될 수 있습니다.

```text
시간 ───────────────────────▶

CPU 1   [ Task A ][ Task A ]
CPU 2   [ Task B ][ Task B ]
```

이것이 병렬 실행입니다. CPU 계산량이 큰 독립 작업이라면 병렬화가 처리 시간을 줄이는 데 도움이 될 수 있습니다.

하지만 thread를 여러 개 만들었다고 반드시 병렬 실행되는 것은 아닙니다. 실제 사용 가능한 CPU, OS scheduling, JDK runtime, 다른 process의 부하에 따라 실행은 달라질 수 있습니다.

### Java의 Thread와 Executor는 실행을 표현하지만 CPU 배치를 보장하지 않는다

```java
try (ExecutorService executor = Executors.newFixedThreadPool(2)) {
    Future<?> first = executor.submit(this::loadProducts);
    Future<?> second = executor.submit(this::loadReviews);

    first.get();
    second.get();
}
```

코드는 두 task를 독립적으로 제출합니다. 그러나 "두 worker가 있으니 반드시 정확히 같은 순간 서로 다른 CPU core에서 실행된다"고 Java 언어가 보장하지는 않습니다.

`Executor`는 **작업과 작업을 실행하는 방법을 분리하는 Java abstraction**이고, 실제 CPU scheduling은 더 아래의 runtime과 OS 영역입니다.

### I/O 작업과 CPU 작업은 동시성을 바라보는 이유가 다르다

백엔드 서버에서는 DB, 외부 API, 파일, 네트워크처럼 기다리는 시간이 많은 작업이 흔합니다.

```text
요청 A: CPU ─ DB 기다림 ─ CPU
요청 B:     CPU ─ API 기다림 ─ CPU
요청 C:          CPU ──────────
```

A가 DB를 기다리는 동안 다른 작업을 진행할 수 있다면 시스템 전체 자원을 더 잘 활용할 수 있습니다. 이 경우 핵심은 CPU 계산을 여러 core에 나누는 것보다 **기다리는 동안 다른 요청이 진행할 수 있도록 하는 동시성**입니다.

반대로 이미지 변환이나 큰 수치 계산처럼 CPU를 계속 사용하는 작업은 core 수와 병렬 실행 정도가 더 직접적인 영향을 줍니다.

| 작업 성격      | 주된 대기/병목 | 먼저 생각할 점                       |
| -------------- | -------------- | ------------------------------------ |
| DB/HTTP 호출   | I/O 대기       | 많은 작업을 효율적으로 기다리는 방법 |
| 파일 읽기      | I/O 대기       | blocking 방식과 thread 사용량        |
| 암호화/계산    | CPU            | 실제 병렬 실행과 core 수             |
| 공유 상태 갱신 | 경쟁           | 동기화와 원자성                      |

### 작업이 많아지면 공유 상태 문제가 함께 생긴다

동시성의 장점만 보고 thread 수를 늘리면 안 됩니다. 여러 작업이 같은 mutable state를 읽고 수정하면 실행 순서가 달라질 때 결과도 달라질 수 있습니다.

```java
counter++;
```

이 한 줄을 여러 thread가 동시에 수행할 때 안전한지는 "병렬인가 동시인가"만으로 결정되지 않습니다. 공유 상태, atomicity, visibility를 따로 확인해야 합니다.

즉 동시성을 사용하면 다음 문제가 함께 등장합니다.

- 작업 완료 순서가 고정되지 않을 수 있음
- 공유 상태에 race condition이 생길 수 있음
- lock이나 queue에서 경쟁할 수 있음
- thread/executor 같은 자원도 한계가 있음

### 문제를 풀 때 이렇게 구분한다

1. 여러 작업의 생명주기가 겹치는가? → concurrency를 생각합니다.
2. 같은 시각에 여러 CPU에서 실제 실행되어야 하는가? → parallelism을 생각합니다.
3. 작업은 CPU 계산이 많은가, I/O 대기가 많은가?
4. 여러 작업이 같은 mutable state를 공유하는가?
5. thread 수가 많아진다고 병목 자원 자체가 늘어나는지 확인합니다.

### 자주 헷갈리는 부분

- 동시성이 있다고 반드시 병렬 실행되는 것은 아닙니다.
- 병렬 실행을 해도 공유 상태의 race가 자동으로 해결되지 않습니다.
- thread를 많이 만들면 CPU 성능이 그만큼 늘어나는 것이 아닙니다.
- Java Thread API는 특정 OS scheduling 순서를 보장하지 않습니다.

### 면접에서 설명한다면

동시성은 여러 작업의 진행이 시간상 겹치도록 구성하는 개념이고, 병렬성은 여러 작업이 실제로 같은 순간에 동시에 실행되는 것을 말한다고 설명할 수 있습니다. 백엔드의 I/O 작업에서는 기다리는 동안 다른 요청을 진행하는 동시성이 중요하고, CPU 중심 작업에서는 실제 core를 활용한 병렬성이 더 직접적인 의미를 가질 수 있습니다. 어느 경우든 공유 상태와 자원 경쟁은 별도로 고려해야 합니다.
