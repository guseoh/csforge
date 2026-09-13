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

### 중간 연산은 pipeline을 구성한다

```java
Stream<String> filtered = names.stream()
        .filter(name -> {
            System.out.println("filter: " + name);
            return name.length() >= 3;
        });
```

여기까지만 작성하면 `filter` lambda가 모든 원소에 즉시 실행된다고 생각하기 쉽지만, 일반적으로 중간 연산은 **무엇을 할지 pipeline을 구성**하고 최종 연산이 결과를 요구할 때 평가가 시작됩니다.

```java
long count = filtered.count();
```

개념적으로는 다음처럼 source에서 필요한 원소를 소비하며 pipeline을 평가한다고 볼 수 있습니다.

```text
source
  │
  ▼
filter ──> map ──> ...
  │
  ▼
terminal operation
  └─ 결과 계산을 위해 pipeline 평가
```

다만 “terminal을 호출하면 모든 중간 lambda가 모든 원소에 반드시 한 번씩 실행된다”라고 일반화하면 안 됩니다. Stream 구현은 결과에 영향을 주지 않는 연산을 생략할 수 있고, short-circuit 연산은 필요한 원소까지만 평가할 수 있습니다. **지연 실행은 실행 시점을 늦춘다는 뜻이지 중간 연산의 호출 횟수를 별도 계약으로 보장한다는 뜻이 아닙니다.**

### 원소 하나가 pipeline을 통과할 수 있다

Stream을 “filter가 전체 목록을 새 목록으로 만들고, 다음 map이 또 전체를 처리한다”고만 상상하면 불필요하게 중간 컬렉션을 떠올리게 됩니다. 많은 pipeline은 한 원소가 여러 중간 연산을 이어 통과하는 방식으로 평가될 수 있습니다.

```java
names.stream()
     .filter(name -> !name.isBlank())
     .map(String::trim)
     .forEach(System.out::println);
```

구체적인 내부 최적화는 구현 세부지만, API 사용 관점에서는 중간 결과 `List`를 단계마다 반드시 만드는 모델이 아니라는 점이 중요합니다.

### short-circuit는 필요한 만큼만 처리할 수 있다

```java
boolean found = numbers.stream()
        .filter(n -> n > 100)
        .anyMatch(n -> n % 2 == 0);
```

조건을 만족하는 원소를 찾으면 `anyMatch`는 나머지 모든 원소를 처리하지 않고 끝날 수 있습니다. `findFirst`, `limit` 등도 pipeline 전체가 반드시 모든 원소를 소비하지 않게 만들 수 있습니다.

```text
1 ─ filter 실패 ───────────────┐
2 ─ filter 통과 ─ anyMatch 성공 ├─ 여기서 종료 가능
3 ─ 아직 필요하지 않음 ────────┘
```

따라서 로그 횟수나 lambda 호출 횟수를 예측할 때는 메서드 체인만 보는 것이 아니라 **terminal operation이 어떤 결과를 요구하고 어디에서 더 이상 탐색할 필요가 없어지는지**까지 추적해야 합니다.

### `peek`를 실행 보장용 callback처럼 사용하지 않는다

`peek`는 pipeline을 관찰하거나 디버깅할 때 유용할 수 있지만, 핵심 비즈니스 side effect가 반드시 실행되어야 하는 위치로 의존하면 안 됩니다.

```java
long count = names.stream()
        .peek(this::audit) // audit 호출 횟수를 business contract로 삼지 않는다
        .count();
```

Stream은 결과 계산에 불필요한 단계의 실행을 생략할 수 있습니다. 외부 저장, 결제, 메시지 발행처럼 실행 자체가 제품 의미인 작업은 Stream 최적화에 기대지 말고 명시적인 처리 경계로 표현하는 편이 안전합니다.

### Stream은 보통 한 번 소비한다

```java
Stream<String> stream = names.stream();
stream.count();
// stream.forEach(...); // 이미 소비된 stream 재사용 불가
```

terminal operation이 끝난 Stream을 다시 사용하려 하면 `IllegalStateException`이 발생할 수 있습니다. 결과를 여러 번 계산해야 한다면 source에서 새 Stream을 만들거나 필요한 결과를 별도로 저장합니다.

### 문제를 풀 때는 실제 요구 흐름을 적는다

Stream 문제에서는 다음 순서로 보면 좋습니다.

1. source가 무엇인지 확인합니다.
2. intermediate operation이 어떤 조건과 변환을 구성하는지 봅니다.
3. terminal operation이 어떤 결과를 요구하는지 확인합니다.
4. short-circuit가 가능한 지점을 찾습니다.
5. 이미 소비된 Stream을 다시 사용하지 않는지 확인합니다.

이 흐름을 잡으면 “중간 연산은 lazy하다”라는 문장을 외우는 데서 끝나지 않고 실제 호출·출력·종료 시점을 추론할 수 있습니다.

### 면접에서 이렇게 나옵니다

#### Q. Stream의 중간 연산은 언제 실행되나요?

`filter`, `map` 같은 intermediate operation은 호출 시 곧바로 source 전체를 처리하기보다 pipeline을 구성하고, terminal operation이 결과를 요구할 때 평가됩니다. 다만 최적화나 short-circuit 때문에 모든 중간 lambda가 모든 원소에 반드시 실행된다고 보장할 수는 없습니다.

#### Q. 하나의 Stream에 terminal operation을 두 번 호출할 수 있나요?

Stream은 한 번 소비하는 처리 흐름입니다. terminal operation 이후 같은 Stream을 다시 사용하면 실패할 수 있으므로, 다시 계산해야 한다면 원래 source에서 새 Stream을 만들어야 합니다.
