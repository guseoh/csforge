---
kind: concept
contentKey: java.core.streams.collectors-grouping-partitioning
topicContentKey: java.core.streams
slug: collectors-grouping-partitioning
title: "Collector로 grouping과 partitioning 하기"
summary: "Stream 결과를 List·Map 같은 컨테이너에 모으고 groupingBy와 partitioningBy로 분류 결과 구조를 설계한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Collectors.html"
    title: "Java SE 25 API: Collectors"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: groupingBy, partitioningBy, downstream collector 계약 확인
---
# Collector로 grouping과 partitioning 하기

Stream에서 원소를 변환한 뒤 최종 결과를 `List`, `Set`, `Map` 같은 구조로 모아야 할 때 `collect`와 `Collectors`를 사용합니다.

```java
List<Long> ids = orders.stream()
        .map(Order::id)
        .collect(Collectors.toList());
```

중요한 점은 외부에 만든 가변 List를 `forEach` 안에서 수정하기보다 **pipeline의 최종 결과로 수집 의도를 표현**할 수 있다는 것입니다.

### groupingBy는 같은 key를 가진 값을 묶는다

```java
Map<OrderStatus, List<Order>> byStatus = orders.stream()
        .collect(Collectors.groupingBy(Order::status));
```

결과는 상태마다 여러 주문을 가진 Map입니다.

```text
READY     → [Order1, Order4]
PAID      → [Order2]
CANCELLED → [Order3]
```

downstream collector를 사용하면 각 그룹에서 다시 개수나 합계를 계산할 수 있습니다.

```java
Map<OrderStatus, Long> counts = orders.stream()
        .collect(Collectors.groupingBy(
                Order::status,
                Collectors.counting()
        ));
```

### partitioningBy는 boolean 두 그룹이다

```java
Map<Boolean, List<Order>> partition = orders.stream()
        .collect(Collectors.partitioningBy(Order::isPaid));
```

`groupingBy`가 여러 key를 만들 수 있는 일반 분류라면 `partitioningBy`는 predicate 결과 `true/false` 두 그룹으로 나누는 용도입니다.

### 결과 Map의 구체 구현을 함부로 가정하지 않는다

`groupingBy` 결과가 항상 `HashMap`이고 순서가 특정 방식이라고 코드가 의존하면 안 됩니다. 필요한 Map 구현이나 정렬이 있다면 해당 overload에서 명시적으로 공급해야 합니다.

### 너무 복잡한 collector는 loop보다 읽기 어려울 수 있다

다단계 grouping, mapping, reducing을 한 표현식에 모두 넣으면 타입을 추적하기 힘들 수 있습니다. collector를 변수로 분리하거나 일반 반복문이 더 명확한 경우도 있습니다.

### 문제를 풀 때 결과 타입을 먼저 쓴다

`groupingBy` 문제에서 가장 먼저 `Map<K, List<T>>`인지 `Map<K, Long>`인지 적어 보세요. downstream collector가 바뀌면 Map의 value 타입도 바뀝니다. **분류 기준 key와 그룹 안에서 무엇을 모을지**를 분리하면 쉽게 이해할 수 있습니다.
