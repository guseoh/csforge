---
kind: concept
contentKey: java.core.streams.parallel-stream-tradeoffs
topicContentKey: java.core.streams
slug: parallel-stream-tradeoffs
title: "병렬 Stream의 선택 기준"
summary: "병렬 Stream이 자동 성능 향상이 아니며 작업 분할·연산 비용·공유 상태·공통 실행 자원과 실제 측정이 필요한 이유를 이해한다"
level: 3
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/BaseStream.html#parallel()"
    title: "Java SE 25 API: BaseStream.parallel"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 병렬 실행 모드 API 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/package-summary.html"
    title: "Java SE 25 Stream Package"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 병렬 축약, 상태 비의존성, 순서 관련 계약 확인
---
# 병렬 Stream의 선택 기준

`parallel()`을 붙였다고 항상 빨라지는 것은 아닙니다. 병렬 처리는 일을 나누고 여러 작업 스레드에서 처리한 뒤 결과를 다시 합치는 비용을 추가합니다. **분할해서 얻는 이익이 이 비용보다 커야** 실제 성능이 좋아집니다.

```java
long sum = values.parallelStream()
        .mapToLong(Value::amount)
        .sum();
```

### 병렬화는 분할 → 계산 → 결합 전체를 본다

```text
순차 실행
[전체 데이터] ─────────> 한 흐름으로 처리

병렬 실행
[전체 데이터]
   ├─ 부분 A ─ 작업 스레드 ─┐
   ├─ 부분 B ─ 작업 스레드 ─┼─> 결과 결합
   └─ 부분 C ─ 작업 스레드 ─┘
```

대체로 데이터가 충분히 많고, 원소별 계산 비용이 의미 있으며, 입력 원본을 효율적으로 나눌 수 있고, 각 작업이 독립적이고, 부분 결과 결합 비용이 크지 않을 때 병렬화의 이득을 검토할 수 있습니다.

작은 `List`에서 단순한 연산만 수행한다면 분할·스케줄링·결합 비용이 실제 계산보다 더 클 수 있습니다.

### 정확성 조건이 성능보다 먼저다

병렬 파이프라인의 람다는 상태 비의존(stateless)이고 비간섭(non-interfering)인지 먼저 확인해야 합니다. 축약 연산도 부분 결과를 어떤 순서로 묶어도 의미가 유지되는 연산이어야 합니다.

```java
int result = numbers.parallelStream()
        .reduce(0, (a, b) -> a - b); // 병렬 축약에 적합하지 않음
```

뺄셈은 결합 순서에 따라 결과가 달라질 수 있습니다. 여기에 외부의 변경 가능한 상태까지 수정한다면 단순 성능 문제가 아니라 결과 정확성부터 깨질 수 있습니다.

```java
List<Integer> result = new ArrayList<>();
values.parallelStream().forEach(result::add); // 안전하지 않음
```

여러 작업 스레드가 같은 변경 가능한 `ArrayList`를 수정하면 데이터 경쟁이 생길 수 있습니다. 병렬화를 검토하기 전에 Stream의 비간섭 계약과 축약 계약을 만족하는지 확인해야 합니다.

### 블로킹 I/O를 단순히 병렬 Stream으로 감싸지 않는다

```java
List<Response> responses = requests.parallelStream()
        .map(this::callBlockingRemote)
        .toList();
```

HTTP나 DB 호출은 CPU 계산과 다른 제약을 가집니다. 작업 스레드를 오래 점유할 수 있고, 동시에 발생하는 외부 요청 수가 연결 풀(connection pool)이나 하위 시스템의 수용량을 넘어설 수도 있습니다.

이런 작업에서는 단순히 "병렬로 실행한다"보다 **동시 실행 수, 시간 제한(timeout), 취소(cancellation), 외부 시스템 보호 정책을 어디에서 제어할지**가 중요합니다. 필요하다면 `Executor`, 가상 스레드, 비동기 API처럼 동시성 정책이 더 명시적으로 드러나는 구조를 검토합니다.

### 실행 자원의 세부는 JDK 구현과 환경에 영향을 받는다

일반적인 JDK 구현에서 병렬 Stream은 `ForkJoinPool`의 공통 실행 자원과 연결되어 동작할 수 있습니다. 따라서 다른 병렬 작업과 자원을 공유하는 상황을 고려할 필요가 있습니다.

하지만 작업 스레드 수나 세부 분할·스케줄링 정책을 Java 언어의 고정 보장처럼 설명하면 안 됩니다. **Stream API 계약과 현재 JDK 구현 세부를 구분**해야 합니다.

### 순서 보장과 스레드 안전성은 다른 문제다

순서가 있는 입력 원본에서 `forEachOrdered`로 원소 순서(encounter order)를 유지할 수 있습니다.

```java
values.parallelStream()
        .map(this::calculate)
        .forEachOrdered(System.out::println);
```

이 선택은 결과 순서를 보존하지만 공유된 변경 가능 상태의 스레드 안전성을 보장하지는 않습니다. 순서 보장, 스레드 안전성, 성능은 서로 다른 기준입니다.

### 마지막 판단은 실제 작업 부하 측정으로 한다

병렬 Stream의 성능은 데이터 크기, 입력 원본의 분할 특성, CPU 수, 연산 비용, JIT, GC, 같은 프로세스에서 실행되는 다른 작업의 영향을 받습니다.

```text
정확성 계약 확인
      ↓
대표 작업 부하 선정
      ↓
순차 실행 기준선 측정
      ↓
병렬 실행 측정
      ↓
지연 시간 / 처리량 / CPU / 공유 자원 영향 비교
```

따라서 `parallelStream()`은 성능 스위치가 아닙니다. **정확성을 먼저 만족시키고, 분할·계산·결합 비용과 공유 자원 영향을 실제 작업 부하에서 비교해 선택하는 도구**로 이해하는 것이 핵심입니다.
