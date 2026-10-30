---
kind: concept
contentKey: java.core.streams.stream-pipeline-laziness
topicContentKey: java.core.streams
slug: stream-pipeline-laziness
title: "Stream 파이프라인(Stream Pipeline)과 지연 실행"
summary: "입력 원본, 중간 연산, 최종 연산을 구분하고 중간 연산이 즉시 모든 데이터를 처리하지 않는 지연 실행과 단락 평가를 이해한다"
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
---
# Stream 파이프라인(Stream Pipeline)과 지연 실행

Stream을 `List` 같은 데이터 저장소로 생각하면 실행 시점을 자주 헷갈립니다. Stream은 원소를 저장하는 컬렉션이라기보다 **소스에서 값을 꺼내 여러 연산을 거쳐 결과를 만드는 처리 파이프라인**입니다.

```java
List<String> names = List.of("kim", "lee", "park");
long count = names.stream()
        .filter(name -> name.length() >= 3)
        .count();
```

여기에는 소스인 `names`, 중간 연산인 `filter`, 최종 연산인 `count`가 있습니다.

![Stream 파이프라인의 지연 실행 흐름](/learning/java/stream-pipeline.svg)

```csforge-viz
{
  "version": 1,
  "type": "java-api-contract",
  "example": "stream-laziness",
  "title": "지연 구성과 조기 종료",
  "description": "순차 예제의 구성과 anyMatch 평가를 단계별로 봅니다."
}
```

### 중간 연산은 바로 소스 전체를 처리하지 않는다

```java
Stream<String> filtered = names.stream()
        .filter(name -> {
            System.out.println("filter: " + name);
            return name.length() >= 3;
        });
```

이 단계에서는 `filter`를 즉시 실행하지 않고 **어떤 처리를 할지 파이프라인을 구성**합니다. 일반적인 최종 연산은 호출될 때 결과를 계산합니다. 다만 `iterator()`와 `spliterator()`는 예외적인 탈출구로, 이후 호출자가 직접 순회할 때 평가가 진행될 수 있습니다.

```java
long count = filtered.count();
```

파이프라인을 구성한 뒤 최종 연산이 필요한 결과를 요구합니다.

다만 최종 연산(terminal 연산)을 호출했다고 모든 중간 lambda가 모든 원소에 정확히 한 번씩 실행된다고 가정해서는 안 됩니다. Stream 구현은 결과에 영향을 주지 않는 단계를 생략할 수 있고 short-circuit 연산은 필요한 원소까지만 소비할 수 있습니다.

### 단계마다 중간 컬렉션을 만드는 모델이 아니다

```java
names.stream()
     .filter(name -> !name.isBlank())
     .map(String::trim)
     .forEach(System.out::println);
```

이 코드를 `filter`가 새 List 전체를 만들고, 그 List를 `map`이 다시 모두 처리한다고 생각할 필요는 없습니다. 개념적으로는 소스의 원소가 필요한 중간 연산을 거쳐 최종 연산(terminal 연산)으로 흘러가는 파이프라인으로 이해하는 편이 좋습니다.

구체적인 fusion이나 최적화 방법은 JDK 구현 세부입니다. API 수준의 핵심은 **중간 결과 컬렉션을 단계마다 명시적으로 만들지 않고 처리 흐름을 구성한다**는 점입니다.

### short-circuit는 소스 전체를 소비하지 않을 수 있다

```java
List<Integer> numbers = List.of(90, 101, 102, 104);
boolean found = numbers.stream()
        .filter(n -> n > 100)
        .anyMatch(n -> n % 2 == 0);
```

조건을 만족하는 원소를 찾으면 `anyMatch`는 이후 원소를 더 볼 필요 없이 끝날 수 있습니다. `findFirst`, `limit` 같은 연산도 전체 소스 소비가 필요하지 않을 수 있습니다.

위 순차 예제에서는 102에서 결과가 true로 결정되어 104를 확인할 필요가 없습니다.

그래서 lambda 호출 횟수를 추론할 때는 파이프라인에 어떤 연산이 있는지만 보지 말고 **최종 연산(terminal 연산)이 어떤 결과를 요구하는지**까지 확인해야 합니다.

### `peek`의 실행 자체를 비즈니스 계약으로 삼지 않는다

```java
long count = names.stream()
        .peek(this::audit)
        .count();
```

`peek`는 관찰과 디버깅에 유용할 수 있지만 핵심 비즈니스 부수 효과가 반드시 몇 번 실행되어야 하는 위치로 의존하기에는 적합하지 않습니다. Stream은 결과 계산에 필요 없는 연산을 생략할 수 있기 때문입니다.

외부 저장, 결제, 메시지 발행처럼 실행 그 자체가 제품 의미라면 Stream 최적화에 기대기보다 명시적인 처리 흐름으로 표현하는 편이 안전합니다.

### Stream은 한 번 소비하는 처리 흐름이다

```java
Stream<String> stream = names.stream();
stream.count();
// stream.forEach(...); // 이미 소비된 Stream 재사용 불가
```

최종 연산(terminal 연산)을 수행한 같은 Stream을 다시 사용하려 하면 실패할 수 있습니다. 여러 번 처리해야 한다면 원래 소스에서 새 Stream을 만들거나 필요한 결과를 따로 저장합니다.

Stream 코드를 읽을 때는 `source → intermediate operations → terminal operation` 순서로 적고, short-circuit 가능 지점을 확인하세요. **중간 연산은 파이프라인을 구성하고 일반적인 최종 연산은 결과를 요구한다**는 흐름이 지연 실행의 핵심입니다. `iterator()`와 `spliterator()`를 반환받는 경우에는 호출자가 실제로 순회하는 시점도 확인합니다.
