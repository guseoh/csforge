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

`parallel()`을 붙였다고 항상 빨라지는 것은 아닙니다. 병렬 처리는 일을 나누고 여러 worker에서 처리한 뒤 결과를 다시 합치는 비용을 추가합니다. **분할해서 얻는 이익이 이 비용보다 커야** 실제 성능이 좋아집니다.

```java
long sum = values.parallelStream()
        .mapToLong(Value::amount)
        .sum();
```

### 병렬화는 split → compute → combine 전체를 본다

```text
Sequential
[전체 데이터] ─────────> 한 흐름으로 처리

Parallel
[전체 데이터]
   ├─ 부분 A ─ worker ─┐
   ├─ 부분 B ─ worker ─┼─> 결과 결합
   └─ 부분 C ─ worker ─┘
```

대체로 데이터가 충분히 많고, 원소별 계산 비용이 의미 있으며, source를 효율적으로 나눌 수 있고, 각 작업이 독립적이고, 부분 결과 결합 비용이 크지 않을 때 병렬화의 이득을 검토할 수 있습니다.

작은 List에서 단순한 연산만 수행한다면 분할·스케줄링·결합 비용이 실제 계산보다 더 클 수 있습니다.

### 정확성 조건이 성능보다 먼저다

병렬 pipeline의 lambda는 stateless하고 non-interfering한지 먼저 확인해야 합니다. reduction도 부분 결과를 어떤 순서로 묶어도 의미가 유지되는 연산이어야 합니다.

```java
int result = numbers.parallelStream()
        .reduce(0, (a, b) -> a - b); // 병렬 reduction에 적합하지 않음
```

뺄셈은 결합 순서에 따라 결과가 달라질 수 있습니다. 여기에 외부 mutable state까지 수정한다면 단순 성능 문제가 아니라 결과 정확성부터 깨질 수 있습니다.

```java
List<Integer> result = new ArrayList<>();
values.parallelStream().forEach(result::add); // 안전하지 않음
```

여러 worker가 같은 mutable `ArrayList`를 수정하면 race condition이 생길 수 있습니다. 병렬화를 검토하기 전에 Stream의 non-interference와 reduction 계약을 만족하는지 확인해야 합니다.

### blocking I/O를 단순히 parallel stream으로 감싸지 않는다

```java
List<Response> responses = requests.parallelStream()
        .map(this::callBlockingRemote)
        .toList();
```

HTTP나 DB 호출은 CPU 계산과 다른 제약을 가집니다. worker를 오래 점유할 수 있고, 동시에 발생하는 외부 요청 수가 connection pool이나 downstream capacity를 넘어설 수도 있습니다.

이런 작업에서는 단순히 "병렬로 실행한다"보다 **동시 실행 수, timeout, cancellation, 외부 시스템 보호 정책을 어디에서 제어할지**가 중요합니다. 필요하다면 Executor, virtual thread, 비동기 API처럼 동시성 정책이 더 명시적으로 드러나는 구조를 검토합니다.

### 실행 자원의 세부는 JDK 구현과 환경에 영향을 받는다

일반적인 JDK 구현에서 parallel stream은 `ForkJoinPool`의 공통 실행 자원과 연결되어 동작할 수 있습니다. 따라서 다른 병렬 작업과 자원을 공유하는 상황을 고려할 필요가 있습니다.

하지만 worker 수나 세부 분할·스케줄링 정책을 Java 언어의 고정 보장처럼 설명하면 안 됩니다. **Stream API 계약과 현재 JDK 구현 세부를 구분**해야 합니다.

### 순서 보장과 thread-safety는 다른 문제다

ordered source에서 `forEachOrdered`로 encounter order를 유지할 수 있습니다.

```java
values.parallelStream()
        .map(this::calculate)
        .forEachOrdered(System.out::println);
```

이 선택은 결과 순서를 보존하지만 공유 가변 상태를 thread-safe하게 만들어 주는 것은 아닙니다. 순서, thread-safety, 성능은 서로 다른 축입니다.

### 마지막 판단은 실제 workload 측정으로 한다

parallel stream의 성능은 데이터 크기, source 분할 특성, CPU 수, 연산 비용, JIT, GC, 같은 프로세스의 다른 workload에 영향을 받습니다.

```text
correctness 계약 확인
      ↓
대표 workload 선정
      ↓
sequential baseline 측정
      ↓
parallel 측정
      ↓
latency / throughput / CPU / shared resource 영향 비교
```

따라서 `parallelStream()`은 성능 스위치가 아닙니다. **정확성을 먼저 만족시키고, 분할·계산·결합 비용과 공유 자원 영향을 실제 workload에서 비교해 선택하는 도구**로 이해하는 것이 핵심입니다.
