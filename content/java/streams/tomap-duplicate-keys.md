---
kind: concept
contentKey: java.core.streams.tomap-duplicate-keys
topicContentKey: java.core.streams
slug: tomap-duplicate-keys
title: "toMap과 중복 key 처리"
summary: "여러 원소가 같은 key로 변환될 수 있을 때 toMap의 충돌을 인식하고 비즈니스 의미에 맞는 merge 정책을 명시한다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Collectors.html#toMap(java.util.function.Function,java.util.function.Function)"
    title: "Java SE 25 API: Collectors.toMap"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: duplicate key와 merge overload의 계약 확인
---
# toMap과 중복 key 처리

Stream의 각 원소를 key와 value로 바꿔 Map을 만들 수 있습니다.

```java
Map<Long, Order> byId = orders.stream()
        .collect(Collectors.toMap(Order::id, Function.identity()));
```

이 코드는 **모든 주문 id가 서로 다르다**는 전제가 숨어 있습니다. 두 원소가 같은 key를 만들면 단순 `toMap(keyMapper, valueMapper)`는 중복 key를 자동으로 덮어쓰는 것이 아니라 실패할 수 있습니다.

### 중복이 가능하면 어떤 값을 남길지 결정해야 한다

```java
Map<String, Member> byEmail = members.stream()
        .collect(Collectors.toMap(
                Member::email,
                Function.identity(),
                (first, second) -> first
        ));
```

이 merge 함수는 같은 이메일이 나오면 첫 값을 유지합니다. 최신 값을 유지하려면 `second`를 선택할 수도 있습니다.

하지만 **어떤 값을 남길지 코드만 편하게 결정하기 전에 중복 자체가 정상인지**를 물어야 합니다. 이메일이 원래 유일해야 하는 도메인이라면 조용히 하나를 버리는 merge는 데이터 오류를 숨길 수 있습니다.

### 합산 같은 자연스러운 merge도 있다

```java
Map<String, Integer> counts = words.stream()
        .collect(Collectors.toMap(
                Function.identity(),
                word -> 1,
                Integer::sum
        ));
```

같은 단어의 개수를 합치는 것은 중복 key가 곧 집계 대상이라는 의미이므로 자연스럽습니다.

### groupingBy와 선택 기준이 다르다

같은 key에 여러 값을 모두 보존해야 한다면 `groupingBy`가 더 맞습니다.

```java
Map<String, List<Member>> grouped = members.stream()
        .collect(Collectors.groupingBy(Member::team));
```

`toMap` merge는 결국 key 하나당 value 하나를 남깁니다.

### 문제를 풀 때 먼저 key 유일성을 확인한다

- key가 정말 유일한가?
- 중복이면 오류여야 하는가?
- 첫 값/마지막 값/합산 중 어떤 정책이 의미 있는가?
- 여러 값을 모두 보관해야 하는가?

`toMap`에서 발생하는 예외를 단순 API 함정으로 외우지 말고 **Map key의 의미와 데이터 계약 문제**로 이해하면 실무에서도 도움이 됩니다.
