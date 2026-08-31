---
kind: concept
contentKey: java.core.collections.list-set-map-contracts
topicContentKey: java.core.collections
slug: list-set-map-contracts
title: "List, Set, Map을 요구사항으로 선택하기"
summary: "순서·중복·포함 여부·key-value 조회 요구를 기준으로 List, Set, Map의 계약을 구분한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html"
    title: "Java SE 25 API: List"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: List 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Set.html"
    title: "Java SE 25 API: Set"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: Set 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html"
    title: "Java SE 25 API: Map"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: Map 계약 확인
---
# List, Set, Map을 요구사항으로 선택하기

컬렉션을 고를 때 `ArrayList가 빠르다`, `HashMap이 O(1)이다` 같은 구현 이야기부터 시작하면 실제 요구를 놓치기 쉽습니다. 먼저 **데이터를 어떤 규칙으로 다뤄야 하는가**를 봐야 합니다.

### 순서와 중복이 의미 있으면 List

`List`는 원소의 순서를 가지며 같은 값이 여러 번 들어갈 수 있습니다.

```java
List<String> history = List.of("LOGIN", "SEARCH", "SEARCH");
```

두 번의 `SEARCH`가 실제 두 번 발생한 사건이라면 중복을 없애면 안 됩니다. index로 특정 위치를 조회해야 하는 요구도 List와 잘 맞습니다.

### 중복 없는 membership이 핵심이면 Set

`Set`은 같은 원소를 중복해서 보관하지 않는 집합 계약을 제공합니다.

```java
Set<String> roles = new HashSet<>();
roles.add("ADMIN");
roles.add("ADMIN");
```

중복 판단은 구현과 원소의 equality 계약에 영향을 받습니다. `HashSet`은 equals/hashCode, `TreeSet`은 ordering 기준이 특히 중요합니다.

Set을 사용했다고 정렬 순서나 삽입 순서가 자동으로 보장되는 것은 아닙니다. 필요한 순서가 있다면 해당 구현의 계약을 따로 확인해야 합니다.

### key로 값을 찾는다면 Map

```java
Map<Long, Member> membersById = new HashMap<>();
membersById.put(1L, member);
Member found = membersById.get(1L);
```

`Map`은 key와 value의 대응 관계를 표현합니다. key는 중복될 수 없고 같은 key로 다시 `put`하면 기존 매핑이 교체될 수 있습니다.

`Map`은 `Collection`의 하위 인터페이스가 아니라 별도의 key-value 추상화입니다.

### 같은 데이터를 다른 관점으로 볼 수도 있다

주문 목록을 화면 순서대로 보여 주려면 `List<Order>`가 자연스럽고, 이미 처리한 주문 ID를 빠르게 membership 확인하려면 `Set<Long>`이 자연스러울 수 있습니다. 주문 ID로 객체를 찾는 lookup 구조가 필요하면 `Map<Long, Order>`가 맞습니다.

즉 도메인 데이터 종류가 하나라고 컬렉션도 하나만 써야 하는 것은 아닙니다. **어떤 연산을 표현하려는지**가 선택 기준입니다.

### 문제를 풀 때 먼저 물을 것

- 중복이 의미 있는가?
- 원소의 순서나 위치가 필요한가?
- “포함되어 있는가?”가 핵심인가?
- key를 통해 값을 찾아야 하는가?
- 정렬된 순서가 필요한가?

이 요구를 먼저 정한 뒤 `ArrayList`, `HashSet`, `TreeMap` 같은 구현체의 성능과 세부 특성을 비교해야 합니다.
