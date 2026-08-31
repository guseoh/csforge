---
kind: concept
contentKey: java.core.streams.parallel-stream-tradeoffs
topicContentKey: java.core.streams
slug: parallel-stream-tradeoffs
title: "Parallel Stream을 선택할 때의 trade-off"
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
# Parallel Stream을 선택할 때의 trade-off

`parallel()`을 붙였다고 CPU core를 더 사용해 항상 빨라지는 것은 아닙니다. 병렬 처리는 일을 나누고, 여러 worker에서 처리하고, 다시 결과를 합치는 비용을 추가합니다. **나눠 얻는 이익이 이 부가 비용보다 커야** 실제 성능이 좋아집니다.

```java
long sum = values.parallelStream()
        .mapToLong(Value::amount)
        .sum();
```

### 병렬화하기 좋은 작업의 조건

대체로 다음 조건에서 가능성을 검토할 수 있습니다.

- 데이터가 충분히 많다.
- 각 원소 계산 비용이 작지 않다.
- source를 효율적으로 분할할 수 있다.
- 각 작업이 서로 독립적이다.
- 결과 합치기 비용이 크지 않다.

작은 List에서 간단한 덧셈만 한다면 분할·스케줄링 비용이 더 클 수 있습니다.

```text
Sequential
[전체 데이터] ─────────> 한 흐름으로 처리

Parallel
[전체 데이터]
   ├─ 부분 A ─ worker
   ├─ 부분 B ─ worker
   └─ 부분 C ─ worker
             ↓
          결과 결합
```

### blocking I/O를 무작정 넣지 않는다

HTTP 호출이나 DB 접근처럼 오래 기다리는 blocking 작업을 parallel stream에 넣으면 공유되는 실행 자원을 오래 점유할 수 있습니다. 또한 동시 요청 수가 외부 시스템의 connection pool이나 rate limit를 넘길 수 있습니다.

이런 작업은 명시적인 Executor, virtual thread, 비동기 API 등 **동시성 제어가 보이는 구조**가 더 적합할 수 있습니다.

### common pool은 애플리케이션 전체 관점에서 본다

일반적인 parallel stream은 JDK 구현에서 공통 `ForkJoinPool`을 활용하는 동작과 연결됩니다. 다른 parallel 작업과 실행 자원을 공유할 수 있으므로 하나의 메서드 성능만 보고 결정하면 안 됩니다.

정확한 worker 수나 내부 분할 정책을 Java 언어 보장처럼 가정해서도 안 됩니다.

### 공유 상태가 있으면 정확성부터 깨질 수 있다

```java
List<Integer> result = new ArrayList<>();
values.parallelStream().forEach(result::add); // 안전하지 않음
```

성능 이전에 여러 worker가 같은 mutable object를 수정하는 race condition이 생깁니다. 병렬 pipeline은 stateless/non-interfering 연산과 올바른 collector를 사용하는 것이 중요합니다.

### 실제 측정 없이 선택하지 않는다

parallel stream 성능은 데이터 크기, CPU 수, JIT warm-up, GC, 다른 workload 등에 따라 달라집니다. microbenchmark라면 JMH처럼 JVM 최적화를 고려하는 도구를 사용하고, 실제 서비스에서는 요청 latency와 자원 사용량을 함께 봐야 합니다.

면접에서도 “parallel stream은 여러 core를 써서 빠르다”가 아니라 **분할·처리·결합 비용과 공유 자원 때문에 workload를 측정해 선택해야 한다**고 설명하는 것이 핵심입니다.
