---
kind: concept
contentKey: java.core.streams.stream-side-effects-noninterference
topicContentKey: java.core.streams
slug: stream-side-effects-noninterference
title: "Stream의 부수효과와 non-interference"
summary: "pipeline이 처리하는 source를 방해하거나 외부 공유 상태를 변경하면 결과 추론과 병렬 안전성이 어려워지는 이유를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/package-summary.html#NonInterference"
    title: "Java SE 25 Stream API: Non-interference"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: non-interference, stateless behavior 관련 공식 설명 확인
---
# Stream의 부수효과와 non-interference

Stream pipeline의 lambda에서 외부 상태를 마음대로 바꿀 수는 있지만, 그렇게 하면 **입력과 출력만 보고 pipeline 결과를 이해하기 어려워집니다.** 특히 처리 중인 source 자체를 수정하거나 여러 실행 흐름이 같은 가변 상태를 변경하면 결과가 불안정해질 수 있습니다.

### source를 처리하면서 동시에 바꾸면 안 된다

```java
List<Integer> values = new ArrayList<>(List.of(1, 2, 3));
values.stream()
      .filter(v -> {
          values.add(v * 10);
          return true;
      })
      .toList();
```

pipeline이 읽고 있는 같은 collection을 중간에 구조적으로 변경하면 iterator/stream의 전제가 깨지고 예외나 예측하기 어려운 결과가 생길 수 있습니다. Stream 문서가 요구하는 **non-interference**는 source가 처리되는 동안 pipeline 동작이 그 source를 방해하지 않는다는 의미와 연결됩니다.

### 외부 List에 add하는 forEach도 주의한다

```java
List<Integer> result = new ArrayList<>();
values.stream()
      .filter(v -> v > 0)
      .forEach(result::add);
```

순차 실행에서는 동작할 수 있지만 pipeline의 결과가 외부 가변 상태에 숨어 있습니다. 다음처럼 수집 의도를 직접 표현할 수 있습니다.

```java
List<Integer> result = values.stream()
        .filter(v -> v > 0)
        .toList();
```

병렬 stream에서 일반 `ArrayList`를 여러 worker가 동시에 수정하면 race condition까지 생길 수 있습니다.

### 모든 부수효과가 금지되는 것은 아니다

로그 출력, metrics 기록처럼 결과 외의 동작이 실제 요구일 수 있습니다. `forEach` 자체도 부수효과를 수행하기 위한 terminal operation입니다.

핵심은 “Stream에서는 side effect 금지”라는 절대 규칙이 아니라 **그 부수효과가 결과의 정확성, source 안정성, 병렬 실행 가능성에 영향을 주는가**를 판단하는 것입니다.

### stateful lambda도 결과를 어렵게 만든다

```java
Set<Integer> seen = new HashSet<>();
stream.filter(seen::add);
```

순차 환경에서 중복 제거처럼 보일 수 있지만 lambda 결과가 이전 호출 상태에 의존합니다. `distinct()`처럼 목적에 맞는 Stream 연산이 있다면 그쪽이 더 안전하고 의도가 분명합니다.

### 문제와 실무에서 확인할 것

- lambda가 source를 직접 변경하는가?
- 외부 mutable state를 읽고 쓰는가?
- 여러 원소 처리 순서가 바뀌면 결과도 달라지는가?
- parallel로 바꿨을 때 data race가 생기는가?
- 같은 목적의 collector나 전용 연산이 있는가?

이 기준으로 보면 Stream 코드의 “짧음”보다 **결과를 쉽게 추론할 수 있는가**를 평가할 수 있습니다.
