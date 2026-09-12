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

`Order` 타입 자체는 그대로 두고 “이번 정렬에서는 금액을 기준으로 본다”는 정책을 호출 지점이나 정책 객체로 분리할 수 있습니다.

### 여러 기준을 우선순위대로 연결할 수 있다

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

`thenComparing`은 두 결과를 더하는 것이 아닙니다. 앞 comparator가 0일 때만 다음 comparator가 tie-breaker로 사용됩니다. 그래서 기준의 우선순위가 코드 순서에 그대로 드러납니다.

### `reversed()`를 어디에 붙이는지도 조합의 일부다

다음 요구를 생각해 봅시다.

> priority는 내림차순, priority가 같으면 id는 오름차순

다음 코드는 얼핏 맞아 보이지만 요구와 다릅니다.

```java
Comparator<Task> order = Comparator
        .comparingInt(Task::priority)
        .thenComparingInt(Task::id)
        .reversed();
```

마지막 `reversed()`는 **앞에서 완성한 comparator 전체를 뒤집습니다.** 따라서 priority뿐 아니라 tie-breaker인 id까지 내림차순이 됩니다.

원하는 기준은 각 단계를 의도대로 조합해야 합니다.

```java
Comparator<Task> order = Comparator
        .comparingInt(Task::priority)
        .reversed()
        .thenComparingInt(Task::id);
```

```text
priority: 내림차순
    │ 같은 priority
    ▼
id      : 오름차순
```

메서드 체인이 길어질수록 “마지막 호출이 어느 범위의 comparator를 변환하는가”를 확인해야 합니다.

### tie-breaker는 정렬 모양뿐 아니라 sorted collection의 원소 구분에도 영향을 준다

`TreeSet`이나 `TreeMap`은 comparator가 0을 반환하는 두 원소를 정렬 기준상 같은 key/원소로 취급합니다.

```java
Comparator<Task> byPriority =
        Comparator.comparingInt(Task::priority);
```

priority가 같은 `Task(id=1)`과 `Task(id=2)`가 실제로는 서로 다른 항목이어도 위 comparator는 0을 반환합니다. 단순 목록 정렬에서는 둘이 같은 우선순위라는 의미가 충분할 수 있지만 `TreeSet`에서 두 항목을 모두 보존해야 한다면 문제가 됩니다.

```java
Comparator<Task> byPriorityThenId = Comparator
        .comparingInt(Task::priority)
        .thenComparingInt(Task::id);
```

따라서 comparator를 만들 때는 “보기 좋은 정렬 순서”뿐 아니라 **비교 결과 0이 해당 API에서 어떤 의미로 사용되는가**까지 확인해야 합니다.

### subtraction comparator는 피한다

```java
(a, b) -> a.score() - b.score()
```

두 값의 차이가 `int` 범위를 넘으면 overflow 때문에 잘못된 부호가 나올 수 있습니다.

```java
Comparator.comparingInt(Player::score)
```

또는 `Integer.compare(a.score(), b.score())`를 사용하는 편이 안전합니다. 비교 결과는 정확한 차이가 아니라 음수·0·양수의 순서 관계가 중요합니다.

### 역순과 null 처리도 명시적인 정책이다

```java
Comparator<Order> newestFirst =
        Comparator.comparing(Order::createdAt).reversed();
```

`null`이 실제로 허용되는 값이라면 `nullsFirst`, `nullsLast`로 정책을 명시할 수 있습니다.

```java
Comparator<String> nullLast =
        Comparator.nullsLast(Comparator.naturalOrder());
```

다만 도메인상 title이 원래 null이면 안 되는 값이라면 comparator에서 조용히 빈 문자열처럼 취급하는 것이 문제를 해결하는 것은 아닙니다. **정렬 정책과 입력 invariant를 구분**해야 합니다.

### 비교 결과는 일관된 순서 관계를 만들어야 한다

Comparator도 자기모순 없는 순서를 제공해야 정렬 알고리즘과 sorted collection이 정상적으로 동작할 수 있습니다. 예를 들어 `a < b`, `b < c`인데 `a > c`가 되는 기준은 추이성을 깨뜨립니다.

또 `compare(a, b) == 0`이 반드시 `a.equals(b)`를 의미하는 것은 아니지만, `TreeSet`·`TreeMap`처럼 정렬 기준으로 원소를 구분하는 컬렉션에서는 그 차이가 실제 포함 결과를 바꿉니다.

그래서 custom comparator는 다음 두 질문을 함께 가져야 합니다.

```text
1. 어떤 순서로 보여 줄 것인가?
2. compare == 0을 이 API가 어떻게 해석하는가?
```

### 코딩테스트와 백엔드에서 모두 자주 나온다

코딩테스트에서는 “점수 내림차순, 이름 오름차순” 같은 복합 조건을 구현할 때 자주 사용합니다. 백엔드에서는 메모리 내 정렬이나 도메인 우선순위 정책을 표현할 수 있습니다.

DB `ORDER BY`를 Java Comparator와 같은 실행 메커니즘으로 생각하면 안 됩니다. DB 정렬은 DB가 수행하고 Java comparator는 JVM 안의 객체 비교 계약입니다. 다만 **여러 정렬 기준의 방향과 우선순위를 명시한다**는 모델링 관점은 비슷합니다.

문제를 풀거나 코드를 리뷰할 때는 각 기준의 방향을 먼저 적고, tie-breaker가 필요한지, `reversed()`가 어느 범위를 뒤집는지, 비교 결과 0이 원소 구분에 어떤 영향을 주는지를 순서대로 확인하면 안전합니다.

### 면접에서 이렇게 나옵니다

#### Q. Comparable과 Comparator는 어떻게 구분하나요?

`Comparable`은 타입 자체가 제공하는 **대표적인 자연 순서**를 정의하고, `Comparator`는 타입 밖에서 특정 문맥의 정렬 정책을 제공합니다. 이름순·최신순·점수순처럼 한 타입에 여러 정렬 기준이 필요하다면 Comparator가 더 자연스럽습니다.

둘은 경쟁 관계가 아닙니다. 타입에 자연 순서가 있어도 특정 화면이나 업무에서는 명시적인 Comparator를 전달해 다른 순서를 사용할 수 있습니다.

#### Q. `thenComparing(...).reversed()`와 `reversed().thenComparing(...)`은 같은가요?

같지 않을 수 있습니다. 완성된 comparator 뒤에 `reversed()`를 호출하면 **그때까지 조합된 전체 비교 순서가 뒤집힙니다.** 첫 번째 기준만 내림차순으로 만들고 tie-breaker는 오름차순으로 유지하려면 첫 번째 comparator를 먼저 `reversed()`한 뒤 `thenComparing`을 붙여야 합니다.
