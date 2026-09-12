---
kind: concept
contentKey: java.core.streams.parallel-stream-tradeoffs
topicContentKey: java.core.streams
slug: parallel-stream-tradeoffs
title: "Parallel Stream의 선택 기준"
summary: "parallel stream이 자동 성능 향상이 아니며 작업 분할·연산 비용·공유 상태·공통 실행 자원과 실제 측정이 필요한 이유를 이해한다"
level: 3
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/BaseStream.html#parallel()"
    title: "Java SE 25 API: BaseStream.parallel"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: parallel execution mode API 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/package-summary.html"
    title: "Java SE 25 Stream Package"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 병렬 reduction, statelessness, ordering 관련 계약 확인
---
# Parallel Stream의 선택 기준

`parallel()`을 붙였다고 CPU core를 더 사용해 항상 빨라지는 것은 아닙니다. 병렬 처리는 일을 나누고, 여러 worker에서 처리하고, 다시 결과를 합치는 비용을 추가합니다. **나눠 얻는 이익이 이 부가 비용보다 커야** 실제 성능이 좋아집니다.

```java
long sum = values.parallelStream()
        .mapToLong(Value::amount)
        .sum();
```

### 병렬화하기 좋은 작업의 조건

대체로 다음 조건에서 가능성을 검토할 수 있습니다.

- 데이터가 충분히 많습니다.
- 각 원소의 계산 비용이 작지 않습니다.
- source를 효율적으로 분할할 수 있습니다.
- 각 작업이 서로 독립적입니다.
- 부분 결과를 합치는 비용이 크지 않습니다.

작은 List에서 간단한 덧셈만 한다면 분할·스케줄링·결합 비용이 실제 계산보다 더 클 수 있습니다.

```text
Sequential
[전체 데이터] ─────────> 한 흐름으로 처리

Parallel
[전체 데이터]
   ├─ 부분 A ─ worker ─┐
   ├─ 부분 B ─ worker ─┼─> 결과 결합
   └─ 부분 C ─ worker ─┘
```

이 그림에서 병렬 처리의 핵심은 단순히 worker 수가 늘어나는 것이 아니라 **split → compute → combine** 전체 비용을 함께 본다는 점입니다.

### 정확성 조건을 성능보다 먼저 확인한다

병렬화하기 전에 각 lambda가 stateless/non-interfering한지, reduction이 병렬 결합에 맞는지 먼저 확인해야 합니다.

```java
int result = numbers.parallelStream()
        .reduce(0, (a, b) -> a - b); // 병렬 reduction에 부적절한 의미
```

뺄셈은 부분 결과를 어떤 순서로 묶는지에 따라 결과가 달라질 수 있으므로 병렬 reduction의 결합 요구와 맞지 않습니다. 여기에 외부 mutable state까지 함께 수정한다면 성능 문제가 아니라 결과 정확성부터 깨질 수 있습니다.

### blocking I/O를 무작정 넣지 않는다

HTTP 호출이나 DB 접근처럼 오래 기다리는 blocking 작업을 parallel stream에 넣으면 실행 worker를 오래 점유할 수 있습니다. 또한 동시에 실행되는 외부 호출 수가 connection pool이나 rate limit, downstream capacity를 넘어설 수도 있습니다.

```java
List<Response> responses = requests.parallelStream()
        .map(this::callBlockingRemote)
        .toList();
```

이 코드는 “병렬”이라는 표현만 있을 뿐 동시 요청 수, timeout, cancellation, retry, 외부 시스템 보호 정책이 명시적으로 보이지 않습니다. 이런 요구에서는 명시적인 Executor, virtual thread, 비동기 API 등 **동시성 제어가 드러나는 구조**가 더 적합한지 검토합니다.

### 실행 pool은 API 계약과 구현 세부를 구분한다

일반적인 JDK 구현의 parallel stream은 `ForkJoinPool`의 공통 실행 자원과 연결되어 동작합니다. 그래서 다른 병렬 작업과 자원을 공유하는 상황을 운영 관점에서 고려할 수 있습니다.

하지만 “parallel stream은 언제나 정확히 N개의 common-pool worker를 사용한다” 같은 설명을 Java 언어나 Stream API의 고정 보장으로 취급하면 안 됩니다. worker 수, 세부 분할·스케줄링 정책은 runtime/JDK 구현과 환경에 영향을 받습니다.

### encounter order를 요구하면 병렬 자유가 줄 수 있다

ordered source에서 `forEachOrdered`처럼 encounter order를 관찰하도록 요구할 수 있습니다. 이 선택은 결과 순서가 제품 계약에 필요한 경우 의미가 있지만 병렬 처리가 자유롭게 완료 순서를 활용할 여지는 줄 수 있습니다.

```java
values.parallelStream()
        .map(this::calculate)
        .forEachOrdered(System.out::println);
```

`forEachOrdered`가 shared mutation을 thread-safe하게 바꾸는 것은 아닙니다. **순서 보장, thread-safety, 성능은 서로 다른 축**으로 봐야 합니다.

### 공유 상태가 있으면 정확성부터 깨질 수 있다

```java
List<Integer> result = new ArrayList<>();
values.parallelStream().forEach(result::add); // 안전하지 않음
```

여러 worker가 같은 mutable `ArrayList`를 수정하면 race condition이 생길 수 있습니다. 병렬 pipeline은 stateless/non-interfering 연산과 요구에 맞는 collector를 사용하는 것이 중요합니다.

### 실제 측정 없이 선택하지 않는다

parallel stream 성능은 데이터 크기, source 분할 특성, CPU 수, 연산 비용, JIT warm-up, GC, 같은 프로세스의 다른 workload 등에 따라 달라집니다. microbenchmark라면 JMH처럼 JVM 최적화를 고려하는 도구를 사용하고, 실제 서비스에서는 요청 latency뿐 아니라 CPU 사용량·throughput·downstream 부하까지 함께 봐야 합니다.

검증 순서는 보통 다음과 같습니다.

```text
correctness 계약 확인
      ↓
대표 workload 선정
      ↓
sequential baseline 측정
      ↓
parallel 측정
      ↓
latency + CPU + shared resource 영향 비교
```

복습할 때도 “parallel stream은 여러 core를 써서 빠르다”가 아니라 **분할·처리·결합 비용과 공유 자원 때문에 workload를 측정해 선택해야 한다**고 설명하는 것이 핵심입니다.

### 면접에서 이렇게 나옵니다

#### Q. Parallel Stream을 사용하면 항상 빨라지나요?

아닙니다. 데이터 분할, worker 스케줄링, 부분 결과 결합이라는 추가 비용이 있고 source의 분할 가능성, 원소별 연산 비용, ordering, shared state에 따라 오히려 느려질 수 있습니다. 실제 workload에서 sequential baseline과 비교해 측정해야 합니다.

#### Q. HTTP나 DB 호출을 `parallelStream()`으로 병렬화하면 왜 주의해야 하나요?

blocking 작업이 실행 worker를 오래 점유할 수 있고 동시에 발생하는 외부 호출 수를 명시적으로 제어하기 어렵습니다. connection pool·rate limit·timeout·retry 같은 운영 제약이 있다면 동시성 정책이 보이는 Executor, virtual thread 등의 구조가 더 적절한지 검토해야 합니다.
