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

```java
Comparator<Order> byAmount =
        Comparator.comparingLong(Order::amount);
```

이 코드는 `Order` 자체의 자연 순서를 정하는 것이 아니라 “이번 정렬에서는 금액을 기준으로 본다”는 정책을 별도로 만듭니다.

### 여러 기준은 우선순위대로 연결한다

금액이 같을 때 ID를 두 번째 기준으로 사용하려면 `thenComparing`을 붙일 수 있습니다.

```java
Comparator<Order> order = Comparator
        .comparingLong(Order::amount)
        .thenComparingLong(Order::id);
```

```text
amount 비교
   │
   ├─ 다름 → 결과 확정
   └─ 같음
        │
        ▼
      id 비교
```

앞 기준이 0일 때만 다음 기준을 사용하므로 코드 순서가 곧 비교 우선순위가 됩니다.

### reversed()가 어느 범위를 뒤집는지 확인한다

“priority는 내림차순, 같은 priority에서는 id 오름차순”이라면 다음 두 코드는 의미가 다릅니다.

```java
Comparator<Task> wrong = Comparator
        .comparingInt(Task::priority)
        .thenComparingInt(Task::id)
        .reversed();
```

마지막 `reversed()`는 지금까지 조합된 전체 Comparator를 뒤집으므로 `id`까지 내림차순이 됩니다.

```java
Comparator<Task> expected = Comparator
        .comparingInt(Task::priority)
        .reversed()
        .thenComparingInt(Task::id);
```

이렇게 하면 첫 번째 기준만 내림차순이고 두 번째 기준은 오름차순으로 유지됩니다.

### 비교 결과 0의 의미는 사용하는 API에 따라 중요하다

```java
Comparator<Task> byPriority =
        Comparator.comparingInt(Task::priority);
```

priority가 같은 서로 다른 두 `Task`에 대해 이 Comparator는 0을 반환합니다. 일반적인 목록 정렬에서는 “같은 우선순위”라는 의미로 충분할 수 있습니다.

하지만 `TreeSet`이나 `TreeMap`은 정렬 기준상 0인 값을 같은 원소나 키처럼 취급합니다. 두 Task를 모두 보존해야 한다면 ID 같은 tie-breaker를 추가해야 할 수 있습니다.

```java
Comparator<Task> byPriorityThenId = Comparator
        .comparingInt(Task::priority)
        .thenComparingInt(Task::id);
```

따라서 Comparator를 설계할 때는 **어떤 순서로 보여 줄지**뿐 아니라 **`compare(a, b) == 0`을 사용하는 API가 어떻게 해석하는지**도 함께 봐야 합니다.

### 뺄셈으로 비교하지 않는다

```java
(a, b) -> a.score() - b.score()
```

두 값의 차이가 `int` 범위를 넘으면 오버플로로 부호가 잘못될 수 있습니다.

```java
Comparator.comparingInt(Player::score)
```

또는 `Integer.compare(a.score(), b.score())` 같은 비교 API를 사용하면 이런 위험을 피할 수 있습니다.

`null`이 실제로 허용되는 데이터라면 `nullsFirst`, `nullsLast`로 정렬 정책을 명시할 수도 있습니다. 다만 원래 `null`이면 안 되는 값까지 Comparator에서 조용히 처리하는 것은 입력 불변 조건과 정렬 정책을 섞는 일이 될 수 있습니다.

`Comparable`이 타입 자체의 대표적인 자연 순서를 표현한다면 `Comparator`는 **특정 문맥의 정렬 정책을 타입 밖에서 구성하는 도구**입니다. 기준의 방향, 우선순위, 0의 의미를 차례로 확인하면 복합 정렬도 안정적으로 설계할 수 있습니다.
