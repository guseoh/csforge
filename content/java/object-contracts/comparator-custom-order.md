---
kind: concept
contentKey: java.core.object-contracts.comparator-custom-order
topicContentKey: java.core.object-contracts
slug: comparator-custom-order
title: "Comparator로 정렬 기준 조합하기"
summary: "타입 밖에서 여러 정렬 기준을 정의하고 comparing·thenComparing으로 안전하게 조합하며 overflow 위험을 피한다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Comparator.html"
    title: "Java SE 25 API: Comparator"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Comparator 계약과 조합 API 확인
---
# Comparator로 정렬 기준 조합하기

하나의 타입을 상황에 따라 여러 방식으로 정렬해야 한다면 자연 순서 하나를 타입에 고정하기보다 `Comparator`로 **외부 정렬 기준**을 표현할 수 있습니다.

예를 들어 주문을 최신순, 금액순, 상태순으로 각각 정렬할 수 있습니다.

```java
Comparator<Order> byAmount =
        Comparator.comparingLong(Order::amount);
```

### 여러 기준을 순서대로 연결할 수 있다

금액이 같으면 ID로 정렬하고 싶다면 `thenComparing`을 사용합니다.

```java
Comparator<Order> order = Comparator
        .comparingLong(Order::amount)
        .thenComparingLong(Order::id);
```

비교 흐름은 다음과 같습니다.

```text
amount 비교
   │
   ├─ 다름 → 결과 확정
   └─ 같음
        │
        ▼
      id 비교
```

이렇게 기준의 우선순위를 코드로 읽을 수 있습니다.

### subtraction comparator는 피한다

```java
(a, b) -> a.score() - b.score()
```

두 값의 차이가 `int` 범위를 넘으면 overflow 때문에 잘못된 정렬 결과를 만들 수 있습니다.

```java
Comparator.comparingInt(Player::score)
```

또는 `Integer.compare(a.score(), b.score())`를 사용하는 편이 안전합니다.

### 역순과 null 처리도 계약으로 표현한다

```java
Comparator<Order> newestFirst =
        Comparator.comparing(Order::createdAt).reversed();
```

`null`이 가능한 값이라면 `nullsFirst`, `nullsLast`로 정책을 명시할 수 있습니다. 다만 도메인상 null이 원래 허용되지 않아야 한다면 comparator에서 조용히 처리하기보다 입력 모델을 바로잡는 것이 더 좋을 수 있습니다.

### 일관된 비교 규칙이 중요하다

Comparator도 비교 결과가 자기모순을 만들지 않아야 정렬 알고리즘과 sorted collection이 정상적으로 동작할 수 있습니다. `a < b`, `b < c`인데 `a > c`처럼 모순되는 기준을 만들면 결과를 신뢰하기 어렵습니다.

또 `compare(a, b) == 0`이 반드시 `a.equals(b)`를 의미하는 것은 아니지만, `TreeSet`·`TreeMap`처럼 정렬 기준으로 원소를 구분하는 컬렉션에서는 그 차이가 중요한 결과를 만들 수 있습니다.

### 코딩테스트와 백엔드에서 모두 자주 나온다

코딩테스트에서는 “점수 내림차순, 이름 오름차순” 같은 복합 조건을 구현할 때 자주 사용합니다. 백엔드에서는 메모리 내 정렬이나 도메인 우선순위 정책을 표현할 수 있습니다. DB `ORDER BY`를 Java Comparator와 같은 것으로 생각하면 안 되지만 **정렬 기준의 우선순위를 명시한다**는 사고는 같습니다.

문제에서는 먼저 각 비교 기준의 방향과 우선순위를 적고, overflow 가능성이 없는 비교 API를 선택하면 안전합니다.
