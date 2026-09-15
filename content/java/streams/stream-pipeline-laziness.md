---
kind: concept
contentKey: java.core.streams.stream-pipeline-laziness
topicContentKey: java.core.streams
slug: stream-pipeline-laziness
title: "Stream Pipeline과 지연 실행"
summary: "source, 중간 연산, 최종 연산을 구분하고 중간 연산이 즉시 모든 데이터를 처리하지 않는 지연 실행과 short-circuit를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html"
    title: "Java SE 25 API: Stream"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: stream pipeline, laziness, non-interference와 consumption 계약 확인
  - url: "https://d2.naver.com/helloworld/4911107"
    title: "네이버 D2: 람다가 이끌어 갈 모던 Java"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 2
    relationNote: lambda와 stream을 실제 Java 코드에 적용하는 흐름 보충
---
# Stream Pipeline과 지연 실행

Stream을 `List` 같은 데이터 저장소로 생각하면 실행 시점을 자주 헷갈립니다. Stream은 원소를 저장하는 컬렉션이라기보다 **source에서 값을 꺼내 여러 연산을 거쳐 결과를 만드는 처리 pipeline**입니다.

```java
List<String> names = List.of("kim", "lee", "park");
long count = names.stream()
        .filter(name -> name.length() >= 3)
        .count();
```

여기에는 source인 `names`, 중간 연산인 `filter`, 최종 연산인 `count`가 있습니다.

![Stream pipeline의 지연 실행 흐름](/learning/java/stream-pipeline.svg)

### 중간 연산은 바로 source 전체를 처리하지 않는다

```java
Stream<String> filtered = names.stream()
        .filter(name -> {
            System.out.println("filter: " + name);
            return name.length() >= 3;
        });
```

이 단계에서는 일반적으로 `filter`가 모든 원소에 즉시 실행되는 것이 아니라 **어떤 처리를 할지 pipeline을 구성**합니다. 최종 연산이 결과를 요구할 때 평가가 시작됩니다.

```java
long count = filtered.count();
```

```text
source
  │
  ▼
filter ──> map ──> ...
  │
  ▼
terminal operation
  └─ 결과를 요구하며 pipeline 평가
```

다만 terminal operation을 호출했다고 모든 중간 lambda가 모든 원소에 정확히 한 번씩 실행된다고 가정해서는 안 됩니다. Stream 구현은 결과에 영향을 주지 않는 단계를 생략할 수 있고 short-circuit 연산은 필요한 원소까지만 소비할 수 있습니다.

### 단계마다 중간 컬렉션을 만드는 모델이 아니다

```java
names.stream()
     .filter(name -> !name.isBlank())
     .map(String::trim)
     .forEach(System.out::println);
```

이 코드를 `filter`가 새 List 전체를 만들고, 그 List를 `map`이 다시 모두 처리한다고 생각할 필요는 없습니다. 개념적으로는 source의 원소가 필요한 중간 연산을 거쳐 terminal operation으로 흘러가는 pipeline으로 이해하는 편이 좋습니다.

구체적인 fusion이나 최적화 방법은 JDK 구현 세부입니다. API 수준의 핵심은 **중간 결과 컬렉션을 단계마다 명시적으로 만들지 않고 처리 흐름을 구성한다**는 점입니다.

### short-circuit는 source 전체를 소비하지 않을 수 있다

```java
boolean found = numbers.stream()
        .filter(n -> n > 100)
        .anyMatch(n -> n % 2 == 0);
```

조건을 만족하는 원소를 찾으면 `anyMatch`는 이후 원소를 더 볼 필요 없이 끝날 수 있습니다. `findFirst`, `limit` 같은 연산도 전체 source 소비가 필요하지 않을 수 있습니다.

```text
원소 1 ─ 조건 실패
원소 2 ─ 조건 통과 ─ anyMatch 성공
원소 3 ─ 평가할 필요 없음
```

그래서 lambda 호출 횟수를 추론할 때는 pipeline에 어떤 연산이 있는지만 보지 말고 **terminal operation이 어떤 결과를 요구하는지**까지 확인해야 합니다.

### `peek`의 실행 자체를 비즈니스 계약으로 삼지 않는다

```java
long count = names.stream()
        .peek(this::audit)
        .count();
```

`peek`는 관찰과 디버깅에 유용할 수 있지만 핵심 비즈니스 side effect가 반드시 몇 번 실행되어야 하는 위치로 의존하기에는 적합하지 않습니다. Stream은 결과 계산에 필요 없는 연산을 생략할 수 있기 때문입니다.

외부 저장, 결제, 메시지 발행처럼 실행 그 자체가 제품 의미라면 Stream 최적화에 기대기보다 명시적인 처리 흐름으로 표현하는 편이 안전합니다.

### Stream은 한 번 소비하는 처리 흐름이다

```java
Stream<String> stream = names.stream();
stream.count();
// stream.forEach(...); // 이미 소비된 Stream 재사용 불가
```

terminal operation을 수행한 같은 Stream을 다시 사용하려 하면 실패할 수 있습니다. 여러 번 처리해야 한다면 원래 source에서 새 Stream을 만들거나 필요한 결과를 따로 저장합니다.

Stream 코드를 읽을 때는 `source → intermediate operations → terminal operation` 순서로 적고, short-circuit 가능 지점을 확인하세요. **중간 연산은 pipeline을 구성하고 실제 평가 요구는 terminal operation에서 발생한다**는 흐름이 지연 실행의 핵심입니다.
