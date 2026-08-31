---
kind: concept
contentKey: java.core.streams.stream-pipeline-laziness
topicContentKey: java.core.streams
slug: stream-pipeline-laziness
title: "Stream pipeline과 지연 실행"
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
---
# Stream pipeline과 지연 실행

Stream을 `List` 같은 데이터 저장소로 생각하면 실행 시점을 자주 헷갈립니다. Stream은 원소를 저장하는 컬렉션이라기보다 **source에서 값을 꺼내 여러 연산을 거쳐 결과를 만드는 처리 pipeline**입니다.

```java
List<String> names = List.of("kim", "lee", "park");
long count = names.stream()
        .filter(name -> name.length() >= 3)
        .count();
```

여기에는 source인 `names`, 중간 연산인 `filter`, 최종 연산인 `count`가 있습니다.

### 중간 연산은 pipeline을 구성한다

```java
Stream<String> filtered = names.stream()
        .filter(name -> {
            System.out.println("filter: " + name);
            return name.length() >= 3;
        });
```

여기까지만 작성하면 `filter` lambda가 모든 원소에 즉시 실행된다고 생각하기 쉽지만, 일반적으로 중간 연산은 **무엇을 할지 pipeline을 구성**하고 최종 연산이 실제 순회를 시작할 때 처리됩니다.

```java
long count = filtered.count();
```

이때 source에서 원소를 가져오며 필요한 연산이 수행됩니다.

```text
source
  │
  ▼
filter ──> map ──> ...
  │
  ▼
terminal operation
  └─ 실제 데이터 소비 시작
```

### 원소 하나가 pipeline을 통과할 수 있다

Stream을 “filter가 전체 목록을 새 목록으로 만들고, 다음 map이 또 전체를 처리한다”고만 상상하면 불필요하게 중간 컬렉션을 떠올리게 됩니다. 많은 pipeline은 한 원소가 여러 중간 연산을 이어 통과하는 방식으로 평가될 수 있습니다.

```java
names.stream()
     .filter(name -> !name.isBlank())
     .map(String::trim)
     .forEach(System.out::println);
```

구체적인 내부 최적화는 구현 세부지만, API 사용 관점에서는 중간 결과 List를 반드시 만드는 것이 아니라는 점이 중요합니다.

### short-circuit는 필요한 만큼만 처리할 수 있다

```java
boolean found = numbers.stream()
        .filter(n -> n > 100)
        .anyMatch(n -> n % 2 == 0);
```

조건을 만족하는 원소를 찾으면 `anyMatch`는 나머지 모든 원소를 처리하지 않고 끝날 수 있습니다. `findFirst`, `limit` 등도 pipeline 전체가 반드시 모든 원소를 소비하지 않게 만들 수 있습니다.

### Stream은 보통 한 번 소비한다

```java
Stream<String> stream = names.stream();
stream.count();
// stream.forEach(...); // 이미 소비된 stream 재사용 불가
```

결과를 여러 번 계산해야 한다면 source에서 새 stream을 만들어야 합니다.

### 문제를 풀 때는 실제 호출 순서를 적는다

출력 순서를 묻는 Stream 문제에서는 메서드 체인만 위에서 아래로 읽지 말고 **최종 연산이 시작된 뒤 각 원소가 어떤 중간 연산을 지나며 언제 멈추는지**를 추적하세요. 지연 실행과 short-circuit를 함께 이해하면 예상하지 못한 출력 횟수 문제를 풀기 쉬워집니다.
