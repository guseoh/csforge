---
kind: concept
contentKey: java.core.streams.stream-map-filter-flatmap
topicContentKey: java.core.streams
slug: stream-map-filter-flatmap
title: "filter, map, flatMap으로 데이터 모양 바꾸기"
summary: "원소를 거르는 filter, 하나를 다른 하나로 바꾸는 map, 중첩된 여러 값을 펼치는 flatMap의 결과 형태를 구분한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html#filter(java.util.function.Predicate)"
    title: "Java SE 25 API: Stream filter/map/flatMap"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: filter, map, flatMap 연산의 계약 확인
---
# filter, map, flatMap으로 데이터 모양 바꾸기

Stream 코드를 읽을 때는 메서드 이름보다 **각 단계 전후에 원소의 개수와 타입이 어떻게 바뀌는지**를 보면 이해하기 쉽습니다.

### filter는 원소를 선택한다

```java
Stream<Order> paid = orders.stream()
        .filter(order -> order.status() == PAID);
```

입력도 `Order`, 출력도 `Order`입니다. 조건에 맞지 않는 원소가 빠질 뿐 원소 자체를 다른 타입으로 바꾸지는 않습니다.

```text
Order A ─ 조건 true  ─> Order A
Order B ─ 조건 false ─> 제거
```

### map은 하나의 원소를 다른 값 하나로 바꾼다

```java
Stream<Long> ids = orders.stream()
        .map(Order::id);
```

`Order → Long`으로 원소 타입이 바뀝니다. 원소 하나당 결과 하나를 만드는 변환이라고 생각하면 좋습니다.

```text
Order → id
Order → id
Order → id
```

### flatMap은 여러 값이 들어 있는 구조를 한 단계 펼친다

주문마다 여러 상품이 있다고 해 보겠습니다.

```java
Stream<List<Item>> nested = orders.stream()
        .map(Order::items);
```

이 결과는 “List들을 원소로 가지는 Stream”입니다. 모든 Item을 하나의 흐름으로 다루고 싶다면 `flatMap`을 사용합니다.

```java
Stream<Item> items = orders.stream()
        .flatMap(order -> order.items().stream());
```

```text
Order A → [A1, A2] ─┐
Order B → [B1]     ─┼─> A1, A2, B1
                    ┘
```

### Optional과 flatMap에서도 같은 생각을 쓸 수 있다

중첩된 컨테이너를 만들지 않고 한 단계 연결한다는 사고는 `Optional.flatMap`에서도 비슷합니다.

```java
Optional<User> user = ...;
Optional<String> email = user.flatMap(User::verifiedEmail);
```

`map`을 사용했을 때 `Optional<Optional<String>>`이 될 상황을 한 단계로 평평하게 만들 수 있습니다.

### flatMap을 무조건 쓰면 읽기 어려울 수 있다

중첩 구조를 실제로 유지해야 하는데 무조건 펼치면 원래 그룹 관계를 잃습니다. 예를 들어 주문별 상품 묶음이 필요한 집계라면 `flatMap`보다 grouping 구조가 더 맞을 수 있습니다.

### 문제를 풀 때 타입을 적는다

각 단계 옆에 `Stream<Order>`, `Stream<List<Item>>`, `Stream<Item>`처럼 타입을 적으면 `map`과 `flatMap` 문제를 훨씬 쉽게 풀 수 있습니다. **무엇을 없애고, 무엇을 변환하고, 어느 중첩 한 단계를 펼치는지**가 핵심입니다.
